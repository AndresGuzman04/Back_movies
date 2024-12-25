import cors from 'cors';

const ACCEPTED_ORIGINS = [
  'http://127.0.0.1:5500',
  'http://localhost:1234',
];

export const corsMiddleware = ({ acceptedOrigins = [...ACCEPTED_ORIGINS] } = {}) => cors({
  origin: (origin, callback) => {
    // Permitir solicitudes de orígenes aceptados
    if (acceptedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permitir solicitudes sin origen (herramientas como Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Bloquear orígenes no aceptados
    console.error(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
  }
});