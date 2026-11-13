import mongoose from 'mongoose';
import { CATEGORIAS } from '../models/Avistamiento.js';

export function errorHTTP(estado, mensaje) {
  return Object.assign(new Error(mensaje), { status: estado });
}

export function validarId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw errorHTTP(400, 'El identificador debe tener 24 caracteres hexadecimales.');
  }
}

export function filtroCategoria(categoria) {
  if (categoria === undefined || categoria === '') return {};
  if (typeof categoria !== 'string' || !CATEGORIAS.includes(categoria)) {
    throw errorHTTP(400, 'La categoría del filtro no es válida.');
  }
  return { categoria };
}

export function leerDatos(body, campos) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw errorHTTP(400, 'Envía un objeto JSON o un formulario con los datos.');
  }
  const datos = {};
  for (const [campo, valor] of Object.entries(body)) {
    if (!campos.includes(campo)) throw errorHTTP(400, `El campo ${campo} no está permitido en esta operación.`);
    if (typeof valor !== 'string' || !valor.trim()) {
      throw errorHTTP(400, `El campo ${campo} debe ser un texto no vacío.`);
    }
    datos[campo] = valor.trim();
  }
  return datos;
}

export const esFormulario = (req) => Boolean(req.is('application/x-www-form-urlencoded'));
