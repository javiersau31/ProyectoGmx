import dotenv from 'dotenv';
dotenv.config();

//configuracion de la conexion a la base de datos 

import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mantenimiento',
  waitForConnections: true,
  connectionLimit: 10

});
