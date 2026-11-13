import { Router } from 'express';
import Avistamiento, { CATEGORIAS, ESTADOS } from '../models/Avistamiento.js';
import { errorHTTP, validarId, filtroCategoria } from '../utils/validacion.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filtro = filtroCategoria(req.query.categoria);
    // lean() devuelve objetos simples que Handlebars puede mostrar.
    const avistamientos = await Avistamiento.find(filtro).sort({ fechaRegistro: -1, _id: -1 }).lean();
    res.render('home', {
      titulo: 'Avistamientos', avistamientos,
      categorias: CATEGORIAS, estados: ESTADOS,
      categoriaFiltro: filtro.categoria ?? '',
      total: avistamientos.length,
    });
  } catch (error) { next(error); }
});

router.get('/editar/:id', async (req, res, next) => {
  try {
    validarId(req.params.id);
    const avistamiento = await Avistamiento.findById(req.params.id).lean();
    if (!avistamiento) throw errorHTTP(404, 'No se encontró el avistamiento.');
    res.render('editar', { titulo: 'Editar avistamiento', avistamiento, estados: ESTADOS });
  } catch (error) { next(error); }
});

export default router;
