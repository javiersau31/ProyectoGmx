import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import establosRoutes from './routes/establos.routes.js';
import ordenesRoutes from './routes/ordenes.routes.js';
import cuadrillasRoutes from './routes/cuadrillas.routes.js';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/clientes', clientesRoutes);
app.use('/establos', establosRoutes);
app.use('/ordenes',ordenesRoutes);
app.use('/cuadrillas', cuadrillasRoutes);


export default app;
