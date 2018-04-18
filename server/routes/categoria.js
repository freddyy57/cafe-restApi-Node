const express = require('express');

const { verifcaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

// =================================
// === MOSTRAR TODAS CATEGORÍAS  ===
// =================================

app.get('/categoria', verifcaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al encontrar categorías',
                    err: err
                });
            }

            Categoria.count({}, (err, conteo) => {

                res.json({
                    ok: true,
                    categorias: categorias,
                    cuantas: conteo
                });

            });

        });

});

// =================================
// === MOSTRAR CATEGORÍA POR ID  ===
// =================================

app.get('/categoria/:id', verifcaToken, (req, res) => {
    // Categoria.findById
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontró categoría',
                err: err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});


// =================================
// ==== CREAR NUEVA CATEGORÍA =====
// =================================

app.post('/categoria', verifcaToken, (req, res) => {
    // regresar nueva categoría
    // req.usuario._id
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear nueva categoría',
                err: err
            });
        }

        // si llega aquí, todo salió bien

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// =================================
// ===== ACTUALIZAR CATEGORÍA =====
// =================================

app.put('/categoria/:id', verifcaToken, (req, res) => {
    // regresar nueva categoría
    // req.usuario._id

    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, { descripcion: body.descripcion, usuario: req.usuario._id }, { new: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar categoria',
                err: err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar categoría',
                err: err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// =================================
// ===== ELIMINAR UNA CATEGORÍA ====
// =================================

app.delete('/categoria/:id', [verifcaToken, verificaAdminRole], (req, res) => {
    // Solo puede borrar un administrador
    // req.usuario._id

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar categoria',
                err: err
            });
        }

        if (!categoriaBorrada) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });

        }

        res.json({
            ok: true,
            categoria: categoriaBorrada,
            message: 'Categoría Borrada'
        });

    });
});

module.exports = app;