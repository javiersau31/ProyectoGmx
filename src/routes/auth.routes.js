import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();

//ruta para login de usuarios

router.post('/login', login);

export default router;
