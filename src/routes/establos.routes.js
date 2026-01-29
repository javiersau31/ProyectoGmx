import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
  crearEstablo,
  obtenerEstablos,
  actualizarEstablo,
  eliminarEstablo
} from '../controllers/establos.controller.js';

const router = Router();

router.get('/', auth, obtenerEstablos);
router.post('/', auth, crearEstablo);
router.put('/:id', auth, actualizarEstablo);
router.delete('/:id', auth, eliminarEstablo);


export default router;
