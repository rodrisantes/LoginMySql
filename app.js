require("dotenv").config()
const express = require("express")
const app = express()
const connection = require("./database/db")
const path = require("path")
const cookieParser = require("cookie-parser")

app.use(express.static("public"))
app.use(express.urlencoded({ extended : false}))
app.use(express.json());
app.use(cookieParser())

app.set("view engine", "ejs")

app.use("/", require("./routes/routes"))

app.use(function(req,res,next){
if(req.email){
res.header("Cache-Control", "private, no-cache, no-store, must-revalidate")
next();
}


})



app.listen(process.env.PORT, ()=>{
    console.log("Server listening on port " + process.env.PORT)
})
