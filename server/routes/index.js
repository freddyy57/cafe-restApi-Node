const express = require('express');
const app = express();


// importar y usar rutas de usuarios
app.use(require('./usuario'));

// importar y usar rutas login
app.use(require('./login'));



module.exports = app;