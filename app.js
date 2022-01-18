//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bcrypt = require('bcrypt');
const generate = require('meaningful-string');
const generator = require('generate-password');
const nodemailer = require('nodemailer');
// const MailComposer = require("nodemailer/lib/mail-composer");
const saltRounds = 10;
// const encrypt=require("mongoose-encryption");
// var md5 = require('md5');
const app=express();
const port=3000;
// var mail = new MailComposer(mailOptions);

mongoose.connect('mongodb://localhost:27017/covidDB');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine","ejs");

const manSchema= new mongoose.Schema({
  hospitalname:String,
  email:String,
  cityname:String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields:["password"]});  encryption using mongoose

const Man = new mongoose.model('Man', manSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/login",function(req,res){
  res.render("login");
});

// Syringe Image
// 	https://www.cowin.gov.in/assets/images/syringe.png

app.post("/",function(req,res){
  if(req.body.button==="login")
  res.render("login");
  else
  res.render("signup");
});

app.post("/signup",function(req,res){
  const man= new Man({
   hospitalname:req.body.hospital,
   email:req.body.emailid,
   cityname:req.body.city
});
  Man.findOne({hospitalname:req.body.hospital,cityname:req.body.city},function(err,foundUser){
  if(foundUser){
    res.render("already");
  }
  else{
   man.save(function(err){
  if(err){
    console.log(err);
  }
  else{
      res.render("registered");
    }
  });
}
});
});

const dataSchema= new mongoose.Schema({
  usernameOfUser:String,
  hashedPassword:String
});

const Data = new mongoose.model('Data', dataSchema);

app.post("/login",function(req,res){
  const userId=req.body.username;
  const pass=req.body.pswd;

  Data.findOne({usernameOfUser:userId,},function(err,foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        bcrypt.compare(pass, foundUser.hashedPassword, function(err, result) {
          if(result===true){
              res.render("orders");
          }
});
    }
  }
  });
});

app.post("/registered",function(req,res){
  var options = {
     "min":6,
     "max":7,
     "capsWithNumbers":true
};
  var userString=generate.random(options);
console.log('Random String:',userString);

  var passwords = generator.generate({
	length: 9,
  numbers:true,
	uppercase: true,
  symbols:"@$",
  strict:true
});
console.log(passwords);

var userCredentials = {
  Username:userString,
  Password:passwords
};

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.from_Email,
    pass: process.env.password
  }
});

var mailOptions = {
  from: process.env.from_Email,
  to: process.env.to_Email,
  subject: 'Sending Email using Node.js',
  text:userString,
  html:userCredentials

  // headers:{
  //   "UserID": userString,
  //   "UserPassword":passwords
  // }
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

bcrypt.hash(passwords, saltRounds, function(err, hash) {
    const data= new Data({
      usernameOfUser:userString,
      hashedPassword:hash
    });
    data.save(function(err){
      if(err){
        console.log(err);
      }
      else{
      console.log("Data Successfully Saved!");
      }
    });
  });

 res.redirect("/login");
});

app.post("/already",function(req,res){
  res.redirect("/login");
});

app.post("/orders",function(req,res){
  res.redirect("/login");
});

app.listen(port,function(){
  console.log("Server is running on port 3000");
});
