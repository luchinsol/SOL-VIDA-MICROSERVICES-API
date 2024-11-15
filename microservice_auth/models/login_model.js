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
            if(existsUser){
                // CLIENTE
                if(existsUser.rol_id === 4){
                    if(existsUser && bcrypt.compare(credenciales.contrasena,existsUser.contrasena)){
                        
                    }
                    return existsUser
                }
                // CONDUCTOR
                else if(existsUser.rol_id === 5){
                    return existsUser
                }
                // EMPLEADO
                else if(existsUser.rol_id === 2){

                }
                else{
                    return { message : 'Roule not authorized!'}
                }
            }
            else{
                return {message:'User not Found'}
            }
            
        } catch (error) {
            
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
    }
}

export default modelAuth