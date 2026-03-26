import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';

import {
  crearOrden,
  obtenerOrdenes,
  obtenerOrdenPorId,
  cambiarEstadoOrden,
  obtenerCalendario,
  actualizarOrden
} from '../controllers/ordenes.controller.js';

const router = Router();

// ===============================
// ÓRDENES DE SERVICIO
// ===============================

// Crear orden
router.post('/', auth, crearOrden);

// Obtener listado de órdenes (con filtros)
router.get('/', auth, obtenerOrdenes);

// Obtener orden por ID
router.get('/:id', auth, obtenerOrdenPorId);

// Cambiar estado de orden
router.patch('/:id/estado', auth, cambiarEstadoOrden);

// Calendario mensual
router.get('/calendario/mes', auth, obtenerCalendario);

router.put('/:id', auth, actualizarOrden);

export default router;
