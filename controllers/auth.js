const connection = require("../database/db");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.register = async (req, res) => {
  try {
    const { user, email, password } = req.body;
    let hashPassword = await bcrypt.hash(password, 8);

    connection.query(
      "INSERT INTO users SET ?",
      { email: email, name: user, password: hashPassword },
      (error, results) => {
        if (error) {
          console.log(error);
        }
        res.redirect("/");
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email + password);

  try {
    if (!email && !password) {
      res.render("login", {
        alert: true,
        alertTitle: "Advertencia",
        alertMessage: "Ingresa email y password",
        alertIcon: "info",
        showConfirmButton: true,
        timer: 8000,
        ruta: "login",
      });
    }
    if (email && !password) {
      res.render("login", {
        alert: true,
        alertTitle: "Advertencia",
        alertMessage: "Ingresa tu password",
        alertIcon: "info",
        showConfirmButton: true,
        timer: 8000,
        ruta: "login",
      });
    }
    if (!email && password) {
      res.render("login", {
        alert: true,
        alertTitle: "Advertencia",
        alertMessage: "Ingresa tu email",
        alertIcon: "info",
        showConfirmButton: true,
        timer: 8000,
        ruta: "login",
      });
    } else {
      connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (error, results) => {
          if (
            results.length === 0 ||
            !(await bcrypt.compare(password, results[0].password))
          ) {
            res.render("login", {
              alert: true,
              alertTitle: "Advertencia",
              alertMessage: "Email o password incorrectas",
              alertIcon: "info",
              showConfirmButton: true,
              timer: 8000,
              ruta: "login",
            });
          } else {
            const id = results[0].id;
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
              expiresIn: process.env.JWT_TIEMPO_EXPIRA,
            });
            console.log("TOKEN : " + token + "para el EMAIL : " + email);
            const cookiesOptions = {
              expires: new Date(
                Date.now() +
                  process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
              ),
              httpOnly: true,
            };
            res.cookie("jwt", token, cookiesOptions);
            res.render("login", {
              alert: true,
              alertTitle: "Conexion esitosa",
              alertMessage: "¡LOGIN CORRECTO!",
              alertIcon: "succes",
              showConfirmButton: true,
              timer: 800,
              ruta: "",
            });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

exports.isAuthenticated = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decodificada = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRETO
      );
      connection.query(
        "SELECT * FROM users WHERE id = ?",
        [decodificada.id],
        (error, results) => {
          if (!results) {
            return next();
          }
          req.email = results[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  }
  else{
    res.redirect("/login")
  }
};

exports.logout = (req,res)=>{
  res.clearCookie("jwt")
  return res.redirect("/")

}