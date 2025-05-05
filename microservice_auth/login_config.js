import pgPromise from 'pg-promise';

const pgp = pgPromise();

// Definir conexiones
const conexiones = {
    db_aguaSol: "postgresql://aguasol_xar2_user:WCJ9WKpeqQdIirMX1z85mRvDsB27IhX5@dpg-cqkps2ogph6c738j8r90-a.oregon-postgres.render.com/aguasol_xar2",
   // db_pool: "postgresql://aguasol_xar2_user:WCJ9WKpeqQdIirMX1z85mRvDsB27IhX5@dpg-cqkps2ogph6c738j8r90-a.oregon-postgres.render.com/micro_signin"
   db_pool: "postgresql://aguasol_xar2_user:WCJ9WKpeqQdIirMX1z85mRvDsB27IhX5@dpg-cqkps2ogph6c738j8r90-a.oregon-postgres.render.com/dev_micro_auth"

};

// Crear objetos de conexión
const db_aguaSol = pgp({ connectionString: conexiones.db_aguaSol, ssl: { rejectUnauthorized: false } });
const db_pool = pgp({ connectionString: conexiones.db_pool, ssl: { rejectUnauthorized: false } });

// Lista de conexiones para probar
const basesDeDatos = { db_aguaSol, db_pool };

// Probar conexiones
Object.entries(basesDeDatos).forEach(([nombre, db]) => {
    db.connect()
        .then(obj => {
            console.log(`✅ DB CONNECTED: ${nombre}`);
            obj.done();
        })
        .catch(err => {
            console.error(`❌ ERROR CONNECTING TO ${nombre}:`, err);
        });
});

// Exportar conexiones
export { db_aguaSol, db_pool };