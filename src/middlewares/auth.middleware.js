import jwt from 'jsonwebtoken';

//middleware para autenticar solicitudes usando JWT

export const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  if (!header.startsWith('Bearer ')) 
    {
      return res.status(401).json({ message: 'Formato de token inválido' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
      return res.status(401).json({ message: 'Token invalido o expirado' });
  }

};
