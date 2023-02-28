// Import Statements and general set up
const express = require("express");
const cookieParser = require("cookie-parser");
const sessions= require('express-session');
const { readFileSync, writeFileSync } = require('fs')
const bodyParser = require('body-parser')
const urlEncoder = bodyParser.urlencoded({extended:true})
const jsonParser = bodyParser.json()
const path = require('path')

// Initializing the Express app
const app = express();
const PORT = 3000;

// Setting up the routing for the views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Routing for static files
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(urlEncoder);

// cookie parser middleware
app.use(cookieParser());

// Setting up the express Session
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

//username and password
const myusername = 'user1@gmail.com'
const mypassword = 'mypassword'

// a variable to save a session
var session;


// Landing page route
app.get('/', (req, res) => {
    session=req.session;
    if(session.userid){
        res.send("Welcome User <a href=\'/logout'>click to logout</a>");
    }else{
        res.render('landing', { root: __dirname });
    }
  });

// Creating a Session
  app.post('/user',(req,res) => {
    console.log("Request body:",req.body.username, req.body.pass);
    if(req.body.username == myusername && req.body.pass == mypassword){
        session=req.session;
        session.userid=req.body.username;
        console.log(req.session)
        res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
    }
    else{
        res.send('Invalid username or password');
    }
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});


// Go to login page
app.get("/login", (req, res) => {
	res.render("login");
});

// Go to signup page
app.get("/signup", (req, res) => {
	res.render("signup");
});


// Running server Message
app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));


