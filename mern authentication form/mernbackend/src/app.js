require('dotenv').config();
const express = require ("express");
const path =require("path");
const app = express();
require("./db/conn");
const  bodyParser = require('body-parser');
const register = require("./models/register");
const Register = require("./models/register");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const jwt = require("jsonwebtoken");

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views"); 

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


const port  = process.env.PORT ||  3000;

app.set('view engine', 'ejs');
app.set("views",template_path);
app.use(cookieParser());
 


app.get("/",(req,res)=>{
    res.render("home");
})
app.get("/secret",(req,auth,res)=>{
    res.render("secret");
})

app.get("/signup",(req,res)=>{
    res.render("signup");
})
app.post("/signup",async (req,res)=>{
    try{
   const password = req.body.password;
   const cpassword = req.body.confirmpassword;

   if(password === cpassword)
   {
    const registerEmployee = new register({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        gender:req.body.gender,
        phone:req.body.phone,
        age:req.body.age,
        password:password,
        confirmpassword:cpassword

    })
//generating tokens
    const token = await registerEmployee.generateAuthToken();
   console.log(token); 

// cookies
// the res.cookie() function is used to set the cookie name to value
// the value parameter may be a string or a object converted to json

// Syntax
//        res.cookie(name,value,[options])

res.cookie("jwt",token,{
    expires : new Date(Date.now + 300000),
    httpOnly:true 
});





    const registered= await registerEmployee.save();
    res.status(201).render('index')

   }else{
    res.send("password doesn't match")

   }}catch(e){
    res.status(400).send(e);

   }
})

app.get("/login",(req,res)=>{
    res.render('login');
})

app.post("/login",async (req,res)=>{
    try{
        const email= req.body.email;
        const password =  req.body.password;

        const usermail = await Register.findOne({email:email});
        const isMatch = bcrypt.compare(password,usermail.password);

        const token = await  usermail.generateAuthToken();
        console.log("the token part"+ token);

        res.cookie("jwt",token,{
            expires:new Date(Date.now() + 300000),
            httpOnly:true
        });

        console.log(`this is the cookie ${req.cookies.jwt}`)

        if(isMatch){
            res.status(201).render('index');
        }
        else{
            res.send("Invalid  Credentials")
        }

    }catch{
        res.status(400).send("Invalid  Credentials")
    }

})




// const createToken = async()=>{
//     const token = await jwt.sign({__id:"64561e3bfad461aea508d682"},"mynameisharshitraiiamagoodman",{
//         expiresIn:"2 hours"

//     });
//     console.log(token);

//     const userVar = await jwt.verify(token,"mynameisharshitraiiamagoodman");
//     console.log(userVar);

// }



app.listen(port,()=>{
    console.log(`server is running at port number ${port}`);
    
})

