// este sera el controlador para manejar ordenes de servicio 
// aqui meter el crud de ordenes de servicio, pero por ahoar  planeo terminar el de clientes y establos primero
// obtener todas las ordenes de servicio
import { pool } from '../config/db.js';

// ===============================
// CREAR ORDEN DE SERVICIO
// ===============================
export const crearOrden = async (req, res) => {
  try {
    const {
      id_cliente,
      id_establo,
      id_cuadrilla,
      fecha_programada,
      semana,
      tipo_servicio,
      falla_reportada
    } = req.body;

    // ---------------------------
    // VALIDACIONES BÁSICAS
    // ---------------------------
    if (!id_cliente || !id_establo || !id_cuadrilla || !fecha_programada || !semana) {
      return res.status(400).json({
        message: 'Cliente, establo, cuadrilla, fecha y semana son requeridos'
      });
    }

    // ---------------------------
    // VALIDAR CLIENTE
    // ---------------------------
    const [cliente] = await pool.query(
      `SELECT id_cliente FROM clientes WHERE id_cliente = ? AND activo = 1`,
      [id_cliente]
    );

    if (cliente.length === 0) {
      return res.status(400).json({ message: 'Cliente no válido' });
    }

    // ---------------------------
    // VALIDAR ESTABLO (PERTENECE AL CLIENTE)
    // ---------------------------
    const [establo] = await pool.query(
      `SELECT id_establo 
       FROM establos 
       WHERE id_establo = ? AND id_cliente = ? AND activo = 1`,
      [id_establo, id_cliente]
    );

    if (establo.length === 0) {
      return res.status(400).json({
        message: 'Establo no válido para el cliente seleccionado'
      });
    }

    // ---------------------------
    // VALIDAR CUADRILLA
    // ---------------------------
    const [cuadrilla] = await pool.query(
      `SELECT id_cuadrilla FROM cuadrillas WHERE id_cuadrilla = ? AND activo = 1`,
      [id_cuadrilla]
    );

    if (cuadrilla.length === 0) {
      return res.status(400).json({ message: 'Cuadrilla no válida' });
    }

    // ---------------------------
    // CREAR ORDEN
    // ---------------------------
    await pool.query(
      `INSERT INTO ordenes_servicio (
        id_cliente,
        id_establo,
        id_cuadrilla,
        fecha_programada,
        semana,
        tipo_servicio,
        falla_reportada,
        estado,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'programada', ?)`,
      [
        id_cliente,
        id_establo,
        id_cuadrilla,
        fecha_programada,
        semana,
        tipo_servicio,
        falla_reportada || null,
        req.user?.id_usuario || null
      ]
    );

    res.status(201).json({ message: 'Orden de servicio creada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la orden de servicio' });
  }
};

export const obtenerCalendario = async (req, res) => {
  try {
    const { mes, anio } = req.query;

    if (!mes || !anio) {
      return res.status(400).json({
        message: 'Mes y año son requeridos'
      });
    }

    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ message: 'Mes inválido' });
    }

    const [rows] = await pool.query(
      `SELECT 
        o.id_orden,
        o.fecha_programada,
        o.estado,
        o.tipo_servicio,
        c.nombre AS cliente,
        e.nombre AS establo,
        q.nombre AS cuadrilla
       FROM ordenes_servicio o
       JOIN clientes c ON o.id_cliente = c.id_cliente
       JOIN establos e ON o.id_establo = e.id_establo
       JOIN cuadrillas q ON o.id_cuadrilla = q.id_cuadrilla
       WHERE o.estado != 'cancelada'
         AND MONTH(o.fecha_programada) = ?
         AND YEAR(o.fecha_programada) = ?
       ORDER BY o.fecha_programada`,
      [mesNum, anioNum]
    );

    // ---------------------------
    // AGRUPAR POR FECHA
    // ---------------------------
    const calendario = {};

    rows.forEach(row => {
      const fecha = row.fecha_programada.toISOString().split('T')[0];

      if (!calendario[fecha]) {
        calendario[fecha] = [];
      }

      calendario[fecha].push({
        id_orden: row.id_orden,
        cliente: row.cliente,
        establo: row.establo,
        cuadrilla: row.cuadrilla,
        estado: row.estado,
        tipo_servicio: row.tipo_servicio
      });
    });

    res.json(calendario);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener calendario' });
  }
};

export const obtenerOrdenes = async (req, res) => {
  try {
    const { estado, id_cliente, id_establo } = req.query;

    let query = `
      SELECT 
        o.id_orden,
        o.fecha_programada,
        o.estado,
        o.tipo_servicio,
        c.nombre AS cliente,
        e.nombre AS establo,
        q.nombre AS cuadrilla
      FROM ordenes_servicio o
      JOIN clientes c ON o.id_cliente = c.id_cliente
      JOIN establos e ON o.id_establo = e.id_establo
      JOIN cuadrillas q ON o.id_cuadrilla = q.id_cuadrilla
      WHERE 1 = 1
    `;

    const params = [];

    if (estado) {
      query += ' AND o.estado = ?';
      params.push(estado);
    }

    if (id_cliente) {
      query += ' AND o.id_cliente = ?';
      params.push(id_cliente);
    }

    if (id_establo) {
      query += ' AND o.id_establo = ?';
      params.push(id_establo);
    }

    query += ' ORDER BY o.fecha_programada DESC';

    const [rows] = await pool.query(query, params);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener órdenes' });
  }
};

export const obtenerOrdenPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        o.id_orden,
        o.fecha_programada,
        o.semana,
        o.estado,
        o.tipo_servicio,
        o.falla_reportada,
        c.nombre AS cliente,
        e.nombre AS establo,
        q.nombre AS cuadrilla
       FROM ordenes_servicio o
       JOIN clientes c ON o.id_cliente = c.id_cliente
       JOIN establos e ON o.id_establo = e.id_establo
       JOIN cuadrillas q ON o.id_cuadrilla = q.id_cuadrilla
       WHERE o.id_orden = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la orden' });
  }
};

export const cambiarEstadoOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = [
      'programada',
      'en_proceso',
      'completada',
      'cancelada'
    ];

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const [result] = await pool.query(
      `UPDATE ordenes_servicio
       SET estado = ?, updated_by = ?
       WHERE id_orden = ?`,
      [estado, req.user?.id_usuario || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json({ message: 'Estado de la orden actualizado' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cambiar estado de la orden' });
  }
  
};