import mongoose from 'mongoose';

export async function conectarDB(uri = process.env.MONGODB_URI) {
  if (!uri || uri.includes('TU_CLUSTER') || uri.includes('CLAVE_CODIFICADA')) {
    throw new Error('Configura MONGODB_URI en el archivo .env antes de iniciar. Consulta README.md.');
  }

  try {
    // El nombre se fija para guardar siempre en la base solicitada por el taller.
    await mongoose.connect(uri, {
      dbName: 'biocaqueta_db',
      serverSelectionTimeoutMS: 10000,
    });
  } catch {
    // No imprimir la URI: puede contener el usuario y la contraseña.
    throw new Error('No fue posible conectar con MongoDB. Revisa la URI, el usuario de base de datos y Network Access en Atlas.');
  }
}
