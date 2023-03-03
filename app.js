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
    body('pass').notEmpty().withMessage('Password is required')
  ];

 const signupValidationChain = [
    body('username').trim().not().isEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('pass').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'), 
    body('confPass').custom((value, { req }) => {
        if (value !== req.body.pass) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
    //body('phoneNumber').isMobilePhone().withMessage('Invalid phone number')
  ];


// Initializing the Express app and setting the PORT
const app = express();
const PORT = process.env.PORT ||4000;

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


// a variable to save a session
var session;

// Creating a Session upon Login
app.post('/userlogin', loginValidationChain, (req,res) => {
    console.log("Request body:",req.body.email, req.body.pass);
    // Server Side Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    // If there were validation errors, send an error response
    return res.status(400).json({ errors: errors.array() });
    }
    
    if(req.body.email=== "admin@socialmarket.com" &&  req.body.pass==="mypassword"){
        return res.redirect("/admin");
    }
    // Login in
    db.query('SELECT * FROM users', function(error, results, fields) {
        if (error){
            throw error;
        }
        else{
            console.log("Results", results);
            console.log("Results length", results.length);

            for (let i = 0; i < results.length; i++) {
                if ((req.body.email === results[i].userEmail) && (req.body.pass === results[i].userPass)) {
                    console.log("Email: ", results[i].userEmail);
                    console.log("Pass: ", results[i].userPass);
                  session = req.session;
                  session.userid = results[i].userID;
                  console.log(req.session);
                  console.log(results[i].userID)
                  req.session.loggedIn = true;
                  console.log("req.session.loggedIn",req.session.loggedIn );
                  return res.render('landing', {loggedIn: req.session.loggedIn});
                }
              }
                return res.render('login', { error: 'Invalid email or password!' });
        }
      });   
});

// Creating a user account upon signup
app.post('/usersignup', signupValidationChain, (req,res) => {
    console.log("Request body:",req.body.username,req.body.email, req.body.pass, req.body.confPass);
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If there were validation errors, send an error response

    return res.status(400).json({ errors: errors.array() });

  }
  // Make sure email is unique
  db.query('SELECT * FROM users WHERE userEmail = ?', [req.body.email], (error, results) => {
    if (error) {
        console.error(error);
        res.status(500).send('Server error');
    } else if (results.length > 0) {
        return res.render('signup', { error: 'Email already exists!' });
    } else {
        // Signup User
        const sql = 'INSERT INTO users (userName, userEmail, userPass) VALUES (?, ?, ?)';
        const values = [req.body.username, req.body.email, req.body.pass];
        db.query(sql, values, (error, results, fields) => {
            if (error) {
            console.error(error);
            console.log("Failed to create user");
            return res.render('landing');
            }
            console.log("User created successfully");
            return res.render('login');
        });
        }
  }); 
});

// Logging out a user
app.get("/logout", (req, res, next) => {
    delete req.session.loggedIn;
	req.session.destroy();
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
	res.header("Expires", "-1");
	res.header("Pragma", "no-cache");
    console.log("Session Destroyed");
	res.redirect("/");
    next();
});

/*-----------------------PAGE ROUTES: GET METHODS------------------------- */
// Landing page route
app.get('/', (req, res) => {
    session=req.session;
    if(session.userid){
        res.render('landing', {loggedIn: req.session.loggedIn});
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

// Go to seller dashboard
app.get("/sellerdashboard", (req, res) => {
	res.render("sellerdashboard");
});

// Go to become a seller page
app.get("/becomeseller", (req, res) => {
	res.render("becomeseller");
});

// Admin Page
app.get("/admin", (req, res) => {
  let usercount;
  let storecount;
  let productcount;
  db.query('SELECT * FROM user', function(error, results, fields) {
    if (error){
        throw error;
    }
    else{
        console.log("Results", results);
        console.log("Results length", results.length);
        usercount= results.length;
        console.log("UserCount", usercount)
        db.query('SELECT * FROM store', function(error, results, fields){
          if (error){
            throw error;
        }
        else{
            console.log("Results", results);
            console.log("Results length", results.length);
            storecount= results.length;
            console.log("StoreCount", storecount)
            db.query('SELECT * FROM product', function(error, results, fields){
              if (error){
                throw error;
            }
            else{
                console.log("Results", results);
                console.log("Results length", results.length);
                productcount= results.length;
                console.log("Product Count", productcount)
                res.render("admin", {usercount:usercount, storecount:storecount, productcount:productcount});
            }
            });
        }
        });
    }
  }); 
});


// User Table
app.get("/userstable", (req, res) => {
  // Getting User information
  db.query('SELECT * FROM user', function(error, results, fields) {
    if (error){
        throw error;
    }
    else{
        console.log("Results", results);
        console.log("Results length", results.length);
        res.render("admintables", {title: "User Information", result:results, userTrue:true});
    }
  }); 
});

// Store Table
app.get("/storestable", (req, res) => {
  db.query('SELECT * FROM store', function(error, results, fields) {
    if (error){
        throw error;
    }
    else{
        console.log("Results", results);
        console.log("Results length", results.length);
        res.render("admintables", {title: "Stores", result:results, storeTrue:true});
    }
  });
});

// Order Table
app.get("/orderstable", (req, res) => {
	res.render("admintables", {title: "Orders", orderTrue:true});
});

// Product Table
app.get("/productstable", (req, res) => {
  db.query('SELECT * FROM product', function(error, results, fields) {
    if (error){
        throw error;
    }
    else{
        console.log("Results", results);
        console.log("Results length", results.length);
        res.render("admintables", {title: "Products", result:results, productTrue:true});
    }
  });
});

/*-----------------------DELETE AND EDIT FUNCTIONALITY--------------------------------------*/
/* --------- Deleting Medical records --------*/
app.delete('/results/:table/:recordID', (req, res) => {
  console.log("Inside app delete");
  console.log("Request Params", req.params);

  const table = req.params.table;
  const resultID = req.params.recordID;

  console.log("ResultID", resultID);
  var sql;
    sql = "DELETE FROM " + table + " WHERE " +table+"ID = " + resultID;


  db.query(sql, function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send('User record deleted successfully.');
  });

});

/*-----------------------Opening and Closing the Server--------------------------------------*/
const server= app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));


// Close the connection when the server stops
server.on('close', () => {
    console.log('Closing database connection...');
    db.end((err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Database connection closed.');
    });
  });