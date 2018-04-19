const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    // Path hacia la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img}`);

    if (fs.existsSync(pathImagen)) {
        // si existe el path envamos la imagen del usuario-producto
        res.sendFile(pathImagen);
    } else {

        // si no existe el path
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        // enviamos no-imagen
        res.sendFile(noImagePath);
    }


});




module.exports = app;