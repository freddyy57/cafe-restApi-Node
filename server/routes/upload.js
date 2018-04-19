const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

// =================================
// ======== SUBIR ARCHIVOS =========
// =================================

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    // Valida tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
                tipo: tipo
            }
        });
    }

    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.');
    // obtenemos el ultimo elemento del arreglo
    // en este caso la extensión del archivo
    let extension = nombreCortado[nombreCortado.length - 1];


    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // si es menor que cero, quiere decir que no se encuentra
    // las extensiones válidas en el arreglo
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiar nombre al archivo
    nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Aquí imagen cargada
        // imagenUsuario(id, res, nombreArchivo);

        switch (tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;

            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;

            default:
                console.log('Tipo no permitido');
                break;

        }

        // res.json({
        //     ok: true,
        //     message: 'Imagen subida correctamente'
        // });
    });

});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe usuario con ese ID'
                }
            });
        }

        // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${ usuarioDB.img}`);
        // // comprobamos si existe el path: pathImagen
        // if (fs.existsSync(pathImagen)) {
        //     // eliminar path con imagen
        //     fs.unlinkSync(pathImagen);
        // }

        // Borrar archivo si está duplicado
        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {

            if (err) {

                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });

        });


    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe producto con ese ID'
                }
            });
        }

        // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${ usuarioDB.img}`);
        // // comprobamos si existe el path: pathImagen
        // if (fs.existsSync(pathImagen)) {
        //     // eliminar path con imagen
        //     fs.unlinkSync(pathImagen);
        // }

        // Borrar archivo si está duplicado
        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {

            if (err) {

                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });

        });


    });

}

function borraArchivo(nombreImagen, tipo) {
    // Borra archivo si está duplicado
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    // comprobamos si existe el path: pathImagen
    if (fs.existsSync(pathImagen)) {
        // eliminar path con imagen
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;