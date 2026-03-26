import { pool } from '../config/db.js';

// ===============================
// OBTENER CUADRILLAS
// ===============================
export const obtenerCuadrillas = async (req, res) => {
  try {
    const { estado } = req.query;

    let query = `
      SELECT 
        id_cuadrilla, 
        nombre, 
        activo
      FROM cuadrillas
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
    res.status(500).json({ message: 'Error al obtener cuadrillas' });
  }
};

// ===============================
// CREAR CUADRILLA
// ===============================
export const crearCuadrilla = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    await pool.query(
      `INSERT INTO cuadrillas (nombre)
       VALUES (?)`,
      [nombre]
    );

    res.status(201).json({ message: 'Cuadrilla creada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear cuadrilla' });
  }
};

// ===============================
// ACTUALIZAR CUADRILLA
// ===============================
export const actualizarCuadrilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    const [result] = await pool.query(
      `UPDATE cuadrillas
       SET nombre = ?
       WHERE id_cuadrilla = ? AND activo = 1`,
      [nombre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cuadrilla no encontrada' });
    }

    res.json({ message: 'Cuadrilla actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar cuadrilla' });
  }
};

// ===============================
// ELIMINAR CUADRILLA (LÓGICO)
// ===============================
export const eliminarCuadrilla = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar existencia
    const [cuadrilla] = await pool.query(
      `SELECT id_cuadrilla 
       FROM cuadrillas 
       WHERE id_cuadrilla = ? AND activo = 1`,
      [id]
    );

    if (cuadrilla.length === 0) {
      return res.status(404).json({ 
        message: 'Cuadrilla no encontrada o ya inactiva' 
      });
    }

    // Verificar órdenes activas
    const [ordenesActivas] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM ordenes_servicio
       WHERE id_cuadrilla = ?
         AND activo = 1
         AND estado IN ('programada','en_proceso')`,
      [id]
    );

    if (ordenesActivas[0].total > 0) {
      return res.status(400).json({
        message: 'No se puede desactivar la cuadrilla porque tiene órdenes activas',
        ordenesActivas: ordenesActivas[0].total
      });
    }

    await pool.query(
      `UPDATE cuadrillas 
       SET activo = 0
       WHERE id_cuadrilla = ?`,
      [id]
    );

    res.json({ message: 'Cuadrilla desactivada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar cuadrilla' });
  }
};
