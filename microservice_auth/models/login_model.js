import { db_pool } from '../login_config.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const SECRET_KEY = 'aguasol'

const modelAuth = {
    Login: async (credenciales) => {
        try {
            // EXISTS USER
            const existsUser = await db_pool.oneOrNone(`SELECT * FROM public.usuario WHERE nickname = $1`,[
                credenciales.nickname
            ])
            if(existsUser!=null){
                // CLIENTE
                if(existsUser.rol_id === 4){
                    console.log("CONTRASENA ----<")
                    console.log(existsUser.contrasena)
                    console.log("...... ? ........")
                    console.log(existsUser && await bcrypt.compare(credenciales.contrasena,existsUser.contrasena))
                    if(existsUser && await bcrypt.compare(credenciales.contrasena,existsUser.contrasena)){
                        const tokenUser = jwt.sign({user:existsUser},SECRET_KEY)
                        return {existsUser,tokenUser}
                    }
                    else{
                        return {message:'Invalid credentials!'}
                    }
                    
                }
                
                // CONDUCTOR
                else if(existsUser.rol_id === 5){
                    if(existsUser && await bcrypt.compare(credenciales.contrasena,existsUser.contrasena)){
                        const tokenUser = jwt.sign({user:existsUser},SECRET_KEY)
                        return {existsUser,tokenUser}
                    }
                    else{
                        return {message:'Invalid credentials!'}
                    }
                }
                else{
                    return { message : 'Roule not authorized!'}
                }
            }
            else{
                return {message:'User not Found'}
            }
            
        } catch (error) {
            throw new Error(`Error query login ${error}`)
        }
    },
    existUser: async (credenciales) => {
        try {

            console.log("............ EXISTE USER ?")
            console.log(credenciales)
            const userExist = await db_pool.oneOrNone(`SELECT * FROM public.usuario WHERE nickname=$1`,
                [credenciales.nickname])

            if (!userExist) {
                return { message: "User new" }
            }
            else {
                return { message: "User exist!" }
            }
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },
    getTelefono: async(id) => {
        try{
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.usuario WHERE id = $1`,[id]
            );
            return resultado;
        }catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },
}

export default modelAuth