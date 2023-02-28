/*-----------------SETUP--------------------*/
// Import Statements and general set up
const express = require("express");
const cookieParser = require("cookie-parser");
const sessions= require('express-session');
const db= require("./dbconnector");
const dotenv = require("dotenv").config();
const { readFileSync, writeFileSync } = require('fs');
const bodyParser = require('body-parser');
const urlEncoder = bodyParser.urlencoded({extended:true})
const jsonParser = bodyParser.json();
const path = require('path');
const { resume } = require("./dbconnector");

// Server Side Validation
const { body, validationResult } = require('express-validator');
const loginValidationChain = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ];


// Initializing the Express app and setting the PORT
const app = express();
const PORT = process.env.PORT ||3000;

// Setting up the routing for the views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Routing for static files
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(urlEncoder);

// cookie parser middleware
app.use(cookieParser());
// Read json files from user login/signup pages
app.use(express.json());



/*-----------------CONNECTING DATABASE--------------------*/
db.connect((err)=>{
    if(err) {throw err;}
    else {
        console.log("Database Connected Succesfully")
    }
})
/*-----------------SESSION MANAGEMENT--------------------*/

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

/*-----------------------PAGE ROUTES------------------------- */
// Landing page route
app.get('/', (req, res) => {
    session=req.session;
    if(session.userid){
        res.send("Welcome User <a href=\'/logout'>click to logout</a>");
    }else{
        res.render('landing', { root: __dirname });
    }
  });

// Go to login page
app.get("/login", (req, res) => {
	res.render("login");
});

// Go to signup page
app.get("/signup", (req, res) => {
	res.render("signup");
});
// Creating a Session
app.post('/user',loginValidationChain, (req,res) => {
    console.log("Request body:",req.body.email, req.body.pass);
    // Server Side Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    // If there were validation errors, send an error response
    return res.status(400).json({ errors: errors.array() });
    }
    // Login in
    db.query('SELECT * FROM users', function(error, results, fields) {
        if (error){
            throw error;
        }
        else{
            console.log("Results", results);
            for (let i = 0; i < results.length; i++) {
                if ((req.body.email == results[i].userEmail) && (req.body.pass == results[i].userPass)) {
                  session = req.session;
                  session.userid = results[i].userID;
                  console.log(req.session);
                  console.log(results[i].userID)
                  return res.render('landing');
                }
                else{
                    res.send('Invalid username or password');
                } 
              }
        }
      });   
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

// Running server Message
app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));


