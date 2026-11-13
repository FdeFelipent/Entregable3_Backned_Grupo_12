import express from 'express';
import { engine } from 'express-handlebars';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { conectarDB } from './config/db.js';
import apiRouter from './routes/api.router.js';
import viewsRouter from './routes/views.router.js';
import { esFormulario } from './utils/validacion.js';

const directorio = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(directorio, '../.env'), quiet: true });

export const app = express();
app.disable('x-powered-by');
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    igual: (a, b) => a === b,
    fecha: (valor) => new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota',
    }).format(new Date(valor)),
    claseEstado: (estado) => ({
      'Preocupación menor': 'menor', Vulnerable: 'vulnerable', 'En peligro': 'peligro',
    })[estado] ?? 'menor',
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(directorio, 'views'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.static(path.join(directorio, 'public')));
app.get('/health', (req, res) => {
  const conectado = mongoose.connection.readyState === 1;
  res.status(conectado ? 200 : 503).json({ estado: conectado ? 'ok' : 'sin conexión' });
});
app.use('/api/avistamientos', apiRouter);
app.use('/', viewsRouter);

app.use((req, res, next) => next(Object.assign(new Error('La ruta solicitada no existe.'), { status: 404 })));

// Los routers usan try/catch y delegan aquí el formato de la respuesta de error.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  let estado = error.status ?? 500;
  let mensaje = error.message;
  let detalles;
  if (error.name === 'ValidationError') {
    estado = 400;
    mensaje = 'Revisa los datos del avistamiento.';
    detalles = Object.values(error.errors).map((e) =>
      e.name === 'CastError' ? `El campo ${e.path} no tiene un valor válido.` : e.message);
  } else if (error.name === 'CastError') {
    estado = 400;
    mensaje = 'Uno de los datos tiene un formato incorrecto.';
  } else if (error.type === 'entity.parse.failed') {
    estado = 400;
    mensaje = 'El cuerpo de la petición no es un JSON válido.';
  } else if (error.type === 'entity.too.large') {
    estado = 413;
    mensaje = 'La petición supera el tamaño permitido.';
  } else if (error.name?.includes('Mongo') || error.name === 'MongooseError') {
    estado = 503;
    mensaje = 'La base de datos no está disponible. Intenta de nuevo más tarde.';
  }
  if (estado >= 500 && estado !== 503) mensaje = 'Ocurrió un error interno al procesar la solicitud.';
  if (req.path.startsWith('/api/') && !esFormulario(req)) {
    return res.status(estado).json({ error: mensaje, ...(detalles ? { detalles } : {}) });
  }
  return res.status(estado).render('error', { titulo: 'Revisar solicitud', estado, mensaje, detalles });
});

export async function iniciarServidor() {
  const puerto = Number(process.env.PORT || 3000);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) throw new Error('PORT debe ser un número entre 1 y 65535.');
  await conectarDB();
  // Render necesita escuchar en todas las interfaces; en local usamos loopback.
  const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  const servidor = app.listen(puerto, host);
  await new Promise((resolve, reject) => {
    servidor.once('listening', resolve);
    servidor.once('error', reject);
  });
  console.log('MongoDB conectado: biocaqueta_db / avistamientos');
  console.log(`BioCaquetá disponible en http://localhost:${puerto}`);
  const cerrar = () => servidor.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
  process.once('SIGINT', cerrar);
  process.once('SIGTERM', cerrar);
  return servidor;
}

// Permite importar app en las pruebas sin abrir un puerto ni conectar con Atlas.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  iniciarServidor().catch(async (error) => {
    console.error(error.code === 'EADDRINUSE' ? 'El puerto está ocupado. Cambia PORT en .env.' : error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}
