import { pool } from '../config/db.js';



//controlador para mejorar establos 

//obtener todos los establos
export const obtenerEstablos = async (req, res) => {
  try {
    const { estado } = req.query;

    let query = `
      SELECT 
        e.id_establo,
        e.nombre,
        e.ubicacion,
        e.id_cliente,
        e.activo,
        c.nombre AS cliente_nombre
      FROM establos e
      JOIN clientes c ON e.id_cliente = c.id_cliente
      WHERE c.activo = 1
    `;

    if (estado === 'activos') {
      query += ' AND e.activo = 1';
    } else if (estado === 'inactivos') {
      query += ' AND e.activo = 0';
    }

    query += ' ORDER BY e.nombre ASC';

    const [rows] = await pool.query(query);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener establos' });
  }
};

// ===============================
// CREAR ESTABLO
// ===============================
export const crearEstablo = async (req, res) => {
  try {
    const { id_cliente, nombre, ubicacion } = req.body;

    if (!id_cliente || !nombre) {
      return res.status(400).json({ message: 'Cliente y nombre requeridos' });
    }

    // Validar que el cliente exista y esté activo
    const [cliente] = await pool.query(
      `SELECT id_cliente FROM clientes WHERE id_cliente = ? AND activo = 1`,
      [id_cliente]
    );

    if (cliente.length === 0) {
      return res.status(400).json({ message: 'Cliente no válido' });
    }

    await pool.query(
      `INSERT INTO establos (id_cliente, nombre, ubicacion)
       VALUES (?, ?, ?)`,
      [id_cliente, nombre, ubicacion]
    );

    res.status(201).json({ message: 'Establo creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear establo' });
  }
};

// ===============================
// ACTUALIZAR ESTABLO
// ===============================
export const actualizarEstablo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ubicacion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    const [result] = await pool.query(
      `UPDATE establos
       SET nombre = ?, ubicacion = ?
       WHERE id_establo = ? AND activo = 1`,
      [nombre, ubicacion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Establo no encontrado' });
    }

    res.json({ message: 'Establo actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar establo' });
  }
};

// ===============================
// ELIMINAR ESTABLO (LÓGICO)
// ===============================
export const eliminarEstablo = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔎 1️⃣ Verificar que exista y esté activo
    const [establo] = await pool.query(
      `SELECT id_establo 
       FROM establos 
       WHERE id_establo = ? AND activo = 1`,
      [id]
    );

    if (establo.length === 0) {
      return res.status(404).json({ 
        message: 'Establo no encontrado o ya inactivo' 
      });
    }

    // 🔎 2️⃣ Verificar órdenes activas
    const [ordenesActivas] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM ordenes_servicio
       WHERE id_establo = ?
         AND activo = 1
         AND estado IN ('programada','en_proceso')`,
      [id]
    );

    if (ordenesActivas[0].total > 0) {
      return res.status(400).json({
        message: 'No se puede desactivar el establo porque tiene órdenes activas',
        ordenesActivas: ordenesActivas[0].total
      });
    }

    // ✅ 3️⃣ Desactivar
    await pool.query(
      `UPDATE establos 
       SET activo = 0 
       WHERE id_establo = ?`,
      [id]
    );

    res.json({ message: 'Establo desactivado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al desactivar establo' });
  }
};