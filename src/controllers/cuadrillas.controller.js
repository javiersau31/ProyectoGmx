import { pool } from '../config/db.js';

// ===============================
// OBTENER CUADRILLAS
// ===============================
export const obtenerCuadrillas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_cuadrilla, nombre
       FROM cuadrillas
       WHERE activo = 1`
    );

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

    const [result] = await pool.query(
      `UPDATE cuadrillas
       SET activo = 0
       WHERE id_cuadrilla = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cuadrilla no encontrada' });
    }

    res.json({ message: 'Cuadrilla eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar cuadrilla' });
  }
};
