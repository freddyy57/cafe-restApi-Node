const express = require('express');
const app = express();


// importar y usar rutas de usuarios
app.use(require('./usuario'));

// importar y usar rutas login
app.use(require('./login'));

// importar y usar ruta categoria
app.use(require('./categoria'));

// importar y usar ruta producto
app.use(require('./producto'));

// importar y usar ruta uploads
app.use(require('./upload'));

// importar y usar ruta imagenes
app.use(require('./imagenes'));



module.exports = app;