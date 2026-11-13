# BioCaquetá — Entregable 3, Grupo 12

Aplicación del taller de Backend para registrar avistamientos de fauna y flora del Piedemonte Amazónico. Incluye una API REST y vistas Handlebars conectadas a MongoDB Atlas.

## Enlaces

- Aplicación: https://biocaqueta-grupo-12.onrender.com
- Repositorio: https://github.com/FdeFelipent/Entregable3_Backned_Grupo_12

## Tecnologías

Node.js, Express, express.Router, Mongoose, MongoDB Atlas y Express-Handlebars. La colección de Postman está en `postman/BioCaqueta.postman_collection.json`.

## Estructura

```text
biocaqueta-app/
├── src/
│   ├── config/db.js
│   ├── models/Avistamiento.js
│   ├── routes/
│   │   ├── api.router.js
│   │   └── views.router.js
│   ├── views/
│   │   ├── layouts/main.handlebars
│   │   ├── home.handlebars
│   │   ├── editar.handlebars
│   │   └── error.handlebars
│   ├── public/
│   │   ├── css/styles.css
│   │   └── js/app.js
│   ├── utils/validacion.js
│   └── app.js
├── postman/BioCaqueta.postman_collection.json
├── .env                  # Solo local, no se publica
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── render.yaml
└── README.md
```

La organización de `src` conserva las rutas del taller. Los archivos adicionales contienen estilos, validación de entradas, respuestas de error y configuración de despliegue. La carpeta del repositorio puede llamarse `Entregable3_Backned_Grupo_12`; el funcionamiento del proyecto no depende de ese nombre.

## Ejecución local

Se utilizó Node.js 24.22.0. Desde la carpeta que contiene `package.json`:

```powershell
npm.cmd install
```

Si aún no existe `.env`, copia `.env.example` como `.env`. Configura tu conexión de Atlas en `MONGODB_URI` y el puerto en `PORT`. No sobrescribas un `.env` ya configurado.

```dotenv
MONGODB_URI="mongodb+srv://USUARIO:CLAVE_CODIFICADA@TU_CLUSTER.mongodb.net/biocaqueta_db?retryWrites=true&w=majority"
PORT=3000
```

```powershell
npm.cmd run dev
```

Abre `http://localhost:3000`. Para iniciar sin recarga automática, usa `npm.cmd start`. En otras terminales puedes escribir `npm` en lugar de `npm.cmd`.

## MongoDB Atlas

La aplicación usa la base `biocaqueta_db` y la colección `avistamientos`. Atlas requiere un usuario de base de datos con acceso a esa base y una entrada de red que permita el equipo o servidor desde donde se conecta la aplicación. Las credenciales se guardan únicamente en `.env` o en las variables privadas del alojamiento.

En Atlas, abre **Browse Collections → biocaqueta_db → avistamientos** para comprobar los documentos. El proyecto no precarga datos de demostración: los registros se crean desde el formulario o la API.

## API y Postman

Importa `postman/BioCaqueta.postman_collection.json`. La variable `baseUrl` comienza en `http://localhost:3000`; puedes reemplazarla por la URL pública del despliegue.

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api/avistamientos` | Lista del más reciente al más antiguo |
| GET | `/api/avistamientos?categoria=Ave` | Filtra por categoría |
| POST | `/api/avistamientos` | Registra un avistamiento |
| PUT | `/api/avistamientos/:id` | Actualiza zona y/o estado de conservación |
| DELETE | `/api/avistamientos/:id` | Elimina un avistamiento |
| POST | `/api/avistamientos/update/:id` | Actualización desde formulario HTML |
| POST | `/api/avistamientos/delete/:id` | Eliminación desde formulario HTML |

Ejecuta las solicitudes de la colección en orden: el POST guarda automáticamente el ID que usarán las solicitudes siguientes. Los cuerpos de la colección son ejemplos para probar la API; no se insertan al iniciar la aplicación.

Campos obligatorios: `nombreComun`, `nombreCientifico`, `categoria`, `zona` e `investigador`. Categorías: `Mamífero`, `Ave`, `Reptil`, `Anfibio` y `Flora`. El estado puede ser `Preocupación menor`, `Vulnerable` o `En peligro`; por defecto se asigna el primero. `fechaRegistro` se genera automáticamente.

## Despliegue en Render

El archivo `render.yaml` describe un servicio Node.js gratuito. También se puede crear un Web Service con:

- Build Command: `npm ci --omit=dev`
- Start Command: `npm start`
- Variables: `NODE_ENV=production`, `NODE_VERSION=24.22.0` y `MONGODB_URI` como variable privada.
- Health Check Path: `/health`

Render asigna el puerto y la aplicación escucha en `0.0.0.0` en producción. Atlas debe permitir las IP de salida del servicio. GitHub almacena el código; Render ejecuta el servidor.

## Validación

La API se comprobó contra Atlas con 15 solicitudes y 22 aserciones de la colección JSON, todas aprobadas. También se verificaron los formularios web y las respuestas a entradas inválidas. El modo demo y los datos ficticios creados para preparar el proyecto se retiraron del entregable.
