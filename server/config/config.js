// ============================
// PUERTO
// ============================

process.env.PORT = process.env.PORT || 3000;


// ============================
// ENTORNO
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ============================
// BASE DE DATOS
// ============================

let urlDB;

if (process.env.NODE_ENV === 'dev') {

    urlDB = 'mongodb://localhost:27017/cafe';

} else {

    urlDB = process.env.MONGO_URI;

}

process.env.URIDB = urlDB;


// ============================
// VENCIMIENTO DEL TOKEN
// ============================
// 60 segundos x 60 minutos x 24 horas x 30 días

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


// ============================
// SEED DEL TOKEN
// ============================

process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-es-el-seed-desarrollo';