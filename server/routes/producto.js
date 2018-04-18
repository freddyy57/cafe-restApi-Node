const express = require('express');

const { verifcaToken } = require('../middlewares/autenticacion');

const app = express();

const Producto = require('../models/producto');

// =================================
// == OBTENER TODOS LOS PRODUCTOS  =
// =================================

// POPULATE - USUARIO-CATEGORÍA
// PAGINADO
// app.get('/productos')

app.get('/producto', verifcaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al encontrar categorías',
                    err: err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    productos: productos,
                    cuantos: conteo
                });

            });

        });

});


// =================================
// == OBTENER UN PRODUCTO POR ID ==
// =================================

// POPULATE - USUARIO-CATEGORÍA
// app.get('/productos/:id')

app.get('/producto/:id', verifcaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al encontrar ID del producto',
                    err: err
                });
            }

            Producto.count({}, verifcaToken, (err, conteo) => {

                res.json({
                    ok: true,
                    producto: productoDB
                });

            });

        });
});

// =================================
// ======= BUSCAR PRODUCTOS =======
// =================================

app.get('/producto/buscar/:termino', (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

// =================================
// ==== CREAR UN NUEVO PRODUCTO ====
// =================================

app.post('/producto', verifcaToken, (req, res) => {
    // regresar nueva categoría
    // req.usuario._id
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio_unitario,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear nuevo producto',
                err: err
            });
        }

        // si llega aquí, todo salió bien

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});


// =================================
// ==== ACTUALIZAR UN PRODUCTO =====
// =================================

app.put('/producto/:id', verifcaToken, (req, res) => {
    // regresar nueva categoría
    // req.usuario._id

    let id = req.params.id;
    let body = req.body;

    let actualizacion = {
        nombre: body.nombre,
        precioUni: body.precio_unitario,
        descripcion: body.descripcion,
        categoria: body.categoria
    };

    Producto.findByIdAndUpdate(id, actualizacion, { new: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El ID del producto no existe ',
                err: err
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto actualizado'
        });
    });

});



// =================================
// ===== ELIMINAR UN PRODUCTO ======
// =================================

// eliminar desactivando al producto

app.delete('/producto/:id', verifcaToken, (req, res) => {

    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!productoBorrado) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });

        }

        res.json({
            ok: true,
            producto: productoBorrado,
            message: 'Producto desactivado'
        });

    });

});





module.exports = app;