//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
//var _ = require('lodash');

var session = require('express-session')
var passport=require("passport");
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'i am raghav patel',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretthingDB");


const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    secrets :[String]
})
const combinesecretSchema=new mongoose.Schema({
    sen:String
})

userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model("User",userSchema);
const Combinesecret=new mongoose.model("Combinesecret",combinesecretSchema)
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function(req,res){
     res.render("home");
})

app.get("/register",function(req,res){
    
     res.render("register");
})
 
app.get("/login",function(req,res){
     res.render("login");
})
app.get("/secrets",function(req,res){
      console.log("hiii ho gya  222");
     if(req.isAuthenticated()){
           
          Combinesecret.find({},function(err,foundcombinesecret){
            if(err){
                console.log(err);
            }
            else{
                    if(foundcombinesecret){
                           res.render("secrets",{allsecrets:foundcombinesecret});
                    }
            }
          })
          console.log("hiii ho gya  222");
         
     }
     else{
          alert("NOT AUTHENticated");
          res.redirect("/login");
     }
})

app.get("/submit",function(req,res){
      console.log("hiii ho gya  222");
     if(req.isAuthenticated()){
          console.log("hiii ho gya  now in to submit");
          res.render("submit");
     }
     else{
          alert("NOT AUTHENticated");
          res.redirect("/login");
     }
})

app.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});


app.post("/submit",function(req,res){

  const submittednewsecret=req.body.secret;
  User.findById(req.user.id,function(err,founduser){
    if(err){
      console.log(err);
    }
    else{
      founduser.secrets.push(submittednewsecret);
      const combinesecretuser =new Combinesecret({
       sen: submittednewsecret
      })
      combinesecretuser.save();
      founduser.save(function(){
        res.redirect("/secrets");
      })
    }
  })
  console.log(req.user);
})
app.post("/register", function(req,res){

  User.register({username:req.body.username},req.body.password,function(err,user){

    if(err){

      console.log("Error in registering.",err);

      res.redirect("/register");

    }else{

      passport.authenticate("local")(req,res, function(){

      console.log(user,101);
     alert("new user....");
        res.redirect("/secrets");

    });

}});


});
    
     

app.post("/login",function(req,res){
       const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        console.log("old user....");
        res.redirect("/secrets");
      });
    }
  });
})



const port=3000;
 
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

