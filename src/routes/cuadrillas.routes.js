import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';

import {
  obtenerCuadrillas,
  crearCuadrilla,
  actualizarCuadrilla,
  eliminarCuadrilla
} from '../controllers/cuadrillas.controller.js';

const router = Router();

router.get('/', auth, obtenerCuadrillas);
router.post('/', auth, crearCuadrilla);
router.put('/:id', auth, actualizarCuadrilla);
router.delete('/:id', auth, eliminarCuadrilla);

export default router;
