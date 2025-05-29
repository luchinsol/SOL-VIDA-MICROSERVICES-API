import { db_pool, db_aguaSol } from "../login_config.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = "aguasol";

const modelAuth = {
  Login: async (credenciales) => {
    try {
      // EXISTS USER
      const existsUser = await db_pool.oneOrNone(
        `SELECT * FROM public.usuario WHERE nickname = $1`,
        [credenciales.nickname]
      );
      if (existsUser != null) {
        // CLIENTE
        if (existsUser.rol_id === 4) {
          console.log("CONTRASENA ----<");
          console.log(existsUser.contrasena);
          console.log("...... ? ........");
          console.log(
            existsUser &&
              (await bcrypt.compare(
                credenciales.contrasena,
                existsUser.contrasena
              ))
          );
          if (
            existsUser &&
            (await bcrypt.compare(
              credenciales.contrasena,
              existsUser.contrasena
            ))
          ) {
            const tokenUser = jwt.sign({ user: existsUser }, SECRET_KEY);
            return { existsUser, tokenUser };
          } else {
            return { message: "Invalid credentials!" };
          }
        }

        // CONDUCTOR
        else if (existsUser.rol_id === 5) {
          if (
            existsUser &&
            (await bcrypt.compare(
              credenciales.contrasena,
              existsUser.contrasena
            ))
          ) {
            const tokenUser = jwt.sign({ user: existsUser }, SECRET_KEY);
            return { existsUser, tokenUser };
          } else {
            return { message: "Invalid credentials!" };
          }
        }

        //CENTRAL
        else if (existsUser.rol_id === 3) {
          if (
            existsUser &&
            (await bcrypt.compare(
              credenciales.contrasena,
              existsUser.contrasena
            ))
          ) {
            const tokenUser = jwt.sign({ user: existsUser }, SECRET_KEY);
            return { existsUser, tokenUser };
          } else {
            return { message: "Invalid credentials!" };
          }
        } else {
          return { message: "Roule not authorized!" };
        }
      } else {
        return { message: "User not Found" };
      }
    } catch (error) {
      throw new Error(`Error query login ${error}`);
    }
  },
  // nuevo método
  updateTelefono: async (telefono, firebaseUId) => {
    try {
      console.log(".....datos put")
      console.log(telefono,firebaseUId)
      const resultado = await db_pool.one(
        `UPDATE public.usuario SET telefono = $1 WHERE firebase_uid = $2 RETURNING *`,
        [telefono.telefono, firebaseUId]
      );
      console.log("..........MODEL LOGIN UPPATE")
      console.log(resultado)

      return resultado;
    } catch (error) {
      throw new Error(`Error en la peticion: ${error}`);
    }
  },

  // nuevo método
  getFirebaseuid: async (firebaseUid) => {
    try {
      console.log(".......firebase....");
      const usuario = await db_pool.oneOrNone(
        `
        SELECT * FROM public.usuario WHERE firebase_uid = $1`,
        [firebaseUid]
      );
      console.log("....hay algo?");
      console.log(usuario);
      return usuario;
    } catch (error) {
      throw new Error(`Error en el servidor ${error}`);
    }
  },

  // modificando ...
  createUser: async (credenciales) => {
    try {
      console.log("/////// en login model");
      console.log(credenciales);
      const userExist = await db_pool.oneOrNone(
        `SELECT * FROM public.usuario WHERE firebase_uid=$1`,
        [credenciales.firebase_uid]
      );

      if (userExist) {
        console.log("...exist en loginmodel");
        return { message: "User exist!" };
      } else {
        const newUser = await db_pool.one(
          `INSERT INTO public.usuario (rol_id,email,telefono,firebase_uid)
                    VALUES ($1,$2,$3,$4) RETURNING *`,
          [
            credenciales.rol_id,
            credenciales.email,
            credenciales.telefono,
            credenciales.firebase_uid,
          ]
        );

        return newUser;
      }
    } catch (error) {
      throw new Error(`Error post user ${error}`);
    }
  },

  createMicroUser: async (credenciales) => {
    try {
      const userExist = await db_pool.oneOrNone(
        ` SELECT * FROM public.usuario WHERE firebase_uid=$1`,
        [credenciales.firebase_uid]
      );

      if (userExist) {
        console.log("......EXISTE ");
        return { message: "User exist!" };
      } else {
        console.log("...........SOY NUEVO");

        const newUser = await db_pool.one(
          `INSERT INTO public.usuario (rol_id, email, telefono,firebase_uid)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [
            credenciales.rol_id,
            credenciales.email,
            credenciales.telefono,
            credenciales.firebase_uid,
          ]
        );

        console.log("...........SOY NUEVO", newUser);

        return newUser;
      }
    } catch (error) {
      throw new Error(`Error post user ${error}`);
    }
  },
  existUser: async (credenciales) => {
    try {
      console.log("............ EXISTE USER ?");
      console.log(credenciales);
      const userExist = await db_pool.oneOrNone(
        `SELECT * FROM public.usuario WHERE nickname=$1`,
        [credenciales.nickname]
      );

      if (!userExist) {
        return { message: "User new" };
      } else {
        return { message: "User exist!" };
      }
    } catch (error) {
      throw new Error(`Error query get: ${error}`);
    }
  },
  getTelefono: async (id) => {
    try {
      const resultadoAguaSol = await db_aguaSol.oneOrNone(
        `SELECT * FROM personal.usuario WHERE id = $1`,
        [id]
      );
      return resultadoAguaSol;
    } catch (error) {
      throw new Error(`Error get data: ${error}`);
    }
  },
  getTelefonoDistribuidor: async (id) => {
    try {
      const resultadoAguaSol = await db_pool.oneOrNone(
        `SELECT telefono FROM public.usuario WHERE id = $1`,
        [id]
      );
      return resultadoAguaSol;
    } catch (error) {
      throw new Error(`Error get data: ${error}`);
    }
  },
};

export default modelAuth;
