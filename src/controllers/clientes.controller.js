import { pool } from '../config/db.js';

//controlador para manejar clientes

// obtener todos los clientes
export const obtenerClientes = async (req, res) => {
    try {
      const { estado } = req.query;

      let query = `
        SELECT 
          id_cliente, 
          nombre, 
          contacto, 
          correo, 
          telefono, 
          direccion, 
          activo
        FROM clientes
        WHERE 1 = 1
      `;

      if (estado === 'activos') {
        query += ' AND activo = 1';
      } else if (estado === 'inactivos') {
        query += ' AND activo = 0';
      }

      query += ' ORDER BY nombre ASC';

      const [rows] = await pool.query(query);

      res.json(rows);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener clientes' });
    }
  };


// crear un nuevo cliente
export const crearCliente = async (req, res) => {
  try {
    const { nombre, contacto, correo, telefono, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    // Validar correo duplicado (si viene)
    if (correo) {
      const [existe] = await pool.query(
        `SELECT id_cliente 
         FROM clientes 
         WHERE correo = ? AND activo = 1`,
        [correo]
      );

      if (existe.length > 0) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
    }

    await pool.query(
      `INSERT INTO clientes (nombre, contacto, correo, telefono, direccion)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, contacto, correo, telefono, direccion]
    );

    res.status(201).json({ message: 'Cliente creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};


// actualizar un cliente existente
export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, contacto, correo, telefono, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    // Validar correo duplicado (excluyendo el propio cliente)
    if (correo) {
      const [existe] = await pool.query(
        `SELECT id_cliente 
         FROM clientes 
         WHERE correo = ? 
           AND id_cliente != ? 
           AND activo = 1`,
        [correo, id]
      );

      if (existe.length > 0) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
    }

    const [result] = await pool.query(
      `UPDATE clientes
       SET nombre = ?, contacto = ?, correo = ?, telefono = ?, direccion = ?
       WHERE id_cliente = ? AND activo = 1`,
      [nombre, contacto, correo, telefono, direccion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};



// eliminar un cliente (marcar como inactivo)
export const eliminarCliente = async (req, res) => {
    try {
      const { id } = req.params;

      // 🔎 1️⃣ Verificar que el cliente exista y esté activo
      const [cliente] = await pool.query(
        `SELECT id_cliente FROM clientes WHERE id_cliente = ? AND activo = 1`,
        [id]
      );

      if (cliente.length === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado o ya inactivo' });
      }

      // 🔎 2️⃣ Verificar establos activos
      const [establosActivos] = await pool.query(
        `SELECT COUNT(*) AS total
        FROM establos
        WHERE id_cliente = ? AND activo = 1`,
        [id]
      );

      if (establosActivos[0].total > 0) {
        return res.status(400).json({
          message: 'No se puede desactivar el cliente porque tiene establos activos',
          establosActivos: establosActivos[0].total
        });
      }

      // 🔎 3️⃣ Verificar órdenes activas (programada o en_proceso)
      const [ordenesActivas] = await pool.query(
        `SELECT COUNT(*) AS total
        FROM ordenes_servicio
        WHERE id_cliente = ?
          AND activo = 1
          AND estado IN ('programada','en_proceso')`,
        [id]
      );

      if (ordenesActivas[0].total > 0) {
        return res.status(400).json({
          message: 'No se puede desactivar el cliente porque tiene órdenes activas',
          ordenesActivas: ordenesActivas[0].total
        });
      }

      // ✅ 4️⃣ Si todo está bien → desactivar
      await pool.query(
        `UPDATE clientes SET activo = 0 WHERE id_cliente = ?`,
        [id]
      );

      res.json({ message: 'Cliente desactivado correctamente' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al desactivar cliente' });
    }
  };
