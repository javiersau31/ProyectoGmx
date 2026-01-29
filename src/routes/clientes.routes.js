import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
  crearCliente,
  obtenerClientes,
  actualizarCliente,
  eliminarCliente
} from '../controllers/clientes.controller.js';

const router = Router();

//rutas para manejar clientes

router.get('/', auth, obtenerClientes);
router.post('/', auth, crearCliente);
router.put('/:id', auth, actualizarCliente);
router.delete('/:id', auth, eliminarCliente);

export default router;
