import { pool } from '../config/db.js';

//controlador para manejar clientes

// obtener todos los clientes
export const obtenerClientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_cliente, nombre, contacto, correo, telefono, direccion FROM clientes WHERE activo = 1'
    );
    res.json(rows);
  } catch (error) {
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

    const [result] = await pool.query(
      `UPDATE clientes
       SET activo = 0
       WHERE id_cliente = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar cliente' });
  }
};
