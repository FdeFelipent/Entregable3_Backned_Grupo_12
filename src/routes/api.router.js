import { Router } from 'express';
import Avistamiento from '../models/Avistamiento.js';
import { errorHTTP, validarId, filtroCategoria, leerDatos, esFormulario } from '../utils/validacion.js';

const router = Router();
const camposRegistro = ['nombreComun', 'nombreCientifico', 'categoria', 'zona', 'estadoConservacion', 'investigador', 'fechaRegistro'];

router.get('/', async (req, res, next) => {
  try {
    const filtro = filtroCategoria(req.query.categoria);
    const avistamientos = await Avistamiento.find(filtro).sort({ fechaRegistro: -1, _id: -1 }).lean();
    res.status(200).json(avistamientos);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const datos = leerDatos(req.body, camposRegistro);
    const avistamiento = await Avistamiento.create(datos);
    if (esFormulario(req)) return res.redirect(303, '/');
    res.status(201).json(avistamiento);
  } catch (error) { next(error); }
});

async function actualizar(req, res, next) {
  try {
    validarId(req.params.id);
    // El taller pide modificar la zona y/o el estado de conservación.
    const cambios = leerDatos(req.body, ['zona', 'estadoConservacion']);
    if (!Object.keys(cambios).length) throw errorHTTP(400, 'Envía la zona o el estado de conservación para actualizar.');
    const avistamiento = await Avistamiento.findByIdAndUpdate(
      req.params.id, { $set: cambios }, { returnDocument: 'after', runValidators: true },
    );
    if (!avistamiento) throw errorHTTP(404, 'No se encontró el avistamiento.');
    if (esFormulario(req)) return res.redirect(303, '/');
    res.status(200).json(avistamiento);
  } catch (error) { next(error); }
}

async function eliminar(req, res, next) {
  try {
    validarId(req.params.id);
    const avistamiento = await Avistamiento.findByIdAndDelete(req.params.id);
    if (!avistamiento) throw errorHTTP(404, 'No se encontró el avistamiento.');
    if (esFormulario(req)) return res.redirect(303, '/');
    res.status(200).json({ mensaje: 'Avistamiento eliminado.', id: avistamiento._id });
  } catch (error) { next(error); }
}

router.put('/:id', actualizar);
router.post('/update/:id', actualizar);
router.delete('/:id', eliminar);
router.post('/delete/:id', eliminar);

export default router;
