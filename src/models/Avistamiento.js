import mongoose from 'mongoose';

export const CATEGORIAS = ['Mamífero', 'Ave', 'Reptil', 'Anfibio', 'Flora'];
export const ESTADOS = ['Preocupación menor', 'Vulnerable', 'En peligro'];

const textoRequerido = (nombre) => ({
  type: String,
  required: [true, `${nombre} es obligatorio.`],
  trim: true,
});

const avistamientoSchema = new mongoose.Schema({
  nombreComun: textoRequerido('El nombre común'),
  nombreCientifico: textoRequerido('El nombre científico'),
  categoria: {
    ...textoRequerido('La categoría'),
    enum: { values: CATEGORIAS, message: 'La categoría no es válida.' },
  },
  zona: textoRequerido('La zona'),
  estadoConservacion: {
    type: String,
    enum: { values: ESTADOS, message: 'El estado de conservación no es válido.' },
    default: 'Preocupación menor',
  },
  investigador: textoRequerido('El investigador'),
  fechaRegistro: { type: Date, default: Date.now },
}, { collection: 'avistamientos', versionKey: false });

export default mongoose.model('Avistamiento', avistamientoSchema);
