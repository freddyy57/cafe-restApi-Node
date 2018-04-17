const jwt = require('jsonwebtoken');

// =================================
// ======= VERIFICAR TOKEN  =======
// =================================

let verifcaToken = (req, res, next) => {

    // Obtenemos el token de la cabecera personalizada
    let token = req.get('token'); // Puede ser Authorization

    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });

};


// =================================
// ==== VERIFICAR ADMIN_ROLE  =====
// =================================

//DATO: Sería más seguro conectrase de nuevo a la BD
// y verificar si tiene o no el ADMIN_ROLE

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;
    // console.log(usuario);

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es un administrador'
            }
        });
    }
};


module.exports = {
    verifcaToken,
    verificaAdminRole
}