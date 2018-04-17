const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// librería google para comprobar token
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');

const app = express();


// =================================
// ======== LOGIN NORMAL  =========
// =================================


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {

            return res.status(400).json({
                ok: false,
                err: err
            });

        }

        if (!usuarioDB) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });

        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });

        }

        // generamos el token
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN }); // expira en 30 días

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });

    });

});


// =================================
// ======== LOGIN GOOGLE  =========
// =================================

// ========================
// Configuraciones de google
// ========================
/* jshint ignore:start */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();

    // console.log(payload.name);
    // console.log(payload.email);
    // console.log(payload.picture);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}



app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                err: {
                    message: 'Fallo al iniciar con google ' + err
                }
            })

        })
        // Aqui todo bien y obtengo los datos de google
        // verificar si ya tengo ese email en BD
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                err: err
            });

        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {

                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });

            } else {

                // generamos el token nuestro
                // renovamos token de google al nuestro
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN }); // expira en 30 días

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            // si no existe creamos el usuario en nuestra BD
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            // como el password es obligatorio
            // ponemos esto:
            usuario.password = ':)';

            // Grabamos en la BD
            usuario.save((err, usuarioDB) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        err: err
                    });

                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN }); // expira en 30 días

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }


    });

});
/* jshint ignore:end */

module.exports = app;