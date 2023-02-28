// Import Statements and general set up
const express = require("express");
const cookieParser = require("cookie-parser");
const { readFileSync, writeFileSync } = require('fs')
const bodyParser = require('body-parser')
const urlEncoder = bodyParser.urlencoded({extended:true})
const jsonParser = bodyParser.json()
const path = require('path')
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
app.use(cookieParser());

// Landing page route
app.get('/', (req, res) => {
    res.render('landing', { root: __dirname });
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


