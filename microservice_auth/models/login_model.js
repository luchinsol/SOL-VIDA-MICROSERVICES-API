import { db_pool } from '../login_config.js';
import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const URLcliente = 'http://localhost:4002/api/v1/cliente';
const SECRET_KEY = 'aguasol'

const modelAuth = {
    Login: async (credenciales) => {
        try {
            console.log(credenciales)
            // CON ESTO VERIFICAMOS EL USUARIO Y PODEMOS EXTRAER EL ID DEL USUARIO
            // E.G. USUARIO 8
            const existUser = await db_pool.oneOrNone(
                `SELECT * FROM public.usuario WHERE nickname = $1 OR telefono=$2 OR email = $3`,
                [credenciales.nickname, credenciales.nickname, credenciales.nickname])
            console.log("------exist", existUser)
            if (existUser) {

                // ROL CLIENTE - CON EL ID DE USUARIO , LO PASAMOS COMO PARÁMETRO A LA URL Y NOS DARÍA EL CLIENTE
                if (existUser.rol_id === 4) {
                    const { id, contrasena } = existUser
                    const resultado = await axios.get(`${URLcliente}/${id}`);
                    const userData = resultado.data


                    if (resultado && await bcrypt.compare(credenciales.contrasena, contrasena)) {

                        // GENERAMOS EL TOKEN : PAYLOAD: INFO, CLAVE
                        const tokenUser = jwt.sign({ user: { id: existUser.id, rol_id: existUser.rol_id } }, SECRET_KEY)
                        console.log("----------TOKEN USER LO MODEL")
                        console.log(tokenUser)
                        return { tokenUser, userData }

                    }

                }
                else {
                    throw new Error('Role not authorized')
                }
            }
            else {
                throw new Error(`User not found`)
            }

        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },
    existUser: async (credenciales) => {
        try {

            console.log("............ EXISTE USER ?")
            console.log(credenciales)
            const userExist = await db_pool.oneOrNone(`SELECT * FROM public.usuario WHERE nickname=$1`,
                [credenciales.nickname])
            
                console.log(userExist)

            if (!userExist) {
                return { message: "User new" }
            }
            else {
                return { message: "User exist!" }
            }
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    }
}

export default modelAuth