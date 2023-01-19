const { Router } = require("express")
const express = require("express")
const router = express.Router()
const authControler = require("../controllers/auth")

router.get("/", authControler.isAuthenticated, (req,res)=>{
    res.render("index.ejs", {email: req.email})
})
router.get("/register", (req,res)=>{
    res.render("register.ejs")
})

router.get("/login", (req,res)=>{
    res.render("login.ejs", {alert:false})
})

router.post("/register", authControler.register)

router.post("/login", authControler.login)

router.get("/logout", authControler.logout)

module.exports=router