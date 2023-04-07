/*-----------------SETUP--------------------*/
// Import Statements and general set up
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');
const sessions= require('express-session');
const bcrypt = require('bcrypt');
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

// handling file upload
app.use(fileUpload());



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

// Compare passwords
async function comparePasswords(inputPassword, hashedPassword) {
  try {
    console.log("Input", inputPassword);
    console.log("Hashed", hashedPassword)

    const result = await bcrypt.compare(inputPassword, hashedPassword);
    console.log("Ressuuult:", result)
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

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

    db.query('SELECT * FROM user', async function(error, results, fields) {
        if (error){
            throw error;
        }
        else{
            console.log("Results", results);
            console.log("Results length", results.length);
            let foundUser= false;

            for (let i = 0; i < results.length; i++) {
              console.log("i: ", i);
              console.log("Email match? ",req.body.email === results[i].userEmail );
              if (req.body.email === results[i].userEmail) {
                console.log("Inside if statement cause email match is true")
                const passwordsMatch= await comparePasswords(req.body.pass, results[i].userPass);
                console.log("PassMatch", passwordsMatch);
                if(passwordsMatch){
                  console.log("Email: ", results[i].userEmail);
                  console.log("Pass: ", results[i].userPass);
                  session = req.session;
                  session.userid = results[i].userID;
                  console.log(req.session);
                  console.log(results[i].userID)
                  req.session.loggedIn = true;
                  console.log("req.session.loggedIn",req.session.loggedIn );
                  foundUser= true;
                  console.log("Found user", foundUser);
                  return res.redirect('/');
                }
                }  
                console.log("No email match, back to the for loop")              
              }
              if(!foundUser){
                console.log("Found user in if statement", foundUser);
                console.log("No user found. Sending error")
                return res.render('login', { error: 'Invalid email or password!' });
              }
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
  db.query('SELECT * FROM user WHERE userEmail = ?', [req.body.email], (error, results) => {
    if (error) {
        console.error(error);
        res.status(500).send('Server error');
    } else if (results.length > 0) {
        return res.render('signup', { error: 'Email already exists!' });
    } else {

        // Encrypt user password
        const saltRounds = 10;
        const plainPassword = req.body.pass;
        let encryptedPass;
        console.log("Plain Passwprd: " ,plainPassword);

        bcrypt.hash(plainPassword, saltRounds, (error, hashedPassword) => {
          if (error) {
            console.error(error);
            return;
          }
          else{
              // Use the hashed password for whatever you need it for
            encryptedPass= hashedPassword;
            console.log("Encrypted Passowrd", encryptedPass);

        // Signup User
        console.log("About to signup a user");
        const sql = 'INSERT INTO user (userName, userEmail, userPass) VALUES (?, ?, ?)';
        const values = [req.body.username, req.body.email, encryptedPass];
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



/*-----------------------Creating Products and Stores------------------------- */


// Creating a store
app.post('/newstore', (req, res) => {
let image;
if (!req.files || !req.files.storeImage) {
    return res.status(400).send('No file uploaded');
  }
else{
  image= req.files.storeImage.data;
}
let newstore= req.body;
newstore.userID= session.userid;
console.log("newstore", newstore);
// Add data to database
console.log("About to create new store");

let storeCategoryString;
let deliveryDayString;
if(Array.isArray(newstore.storeCategory)){
  storeCategoryString = newstore.storeCategory.join(',');
}
else{
  storeCategoryString = newstore.storeCategory

}
console.log("storeCategory", storeCategoryString);

if(Array.isArray(newstore.deliveryDay)){
  deliveryDayString = newstore.deliveryDay.join(',');
}
else{
  deliveryDayString = newstore.deliveryDay;
}
console.log("deliveryDay", deliveryDayString);
console.log("Value is category string", storeCategoryString);

const sql = 'INSERT INTO store (storeName, storeCategory, userID, storeDescription, storeImage, storeDeliveryPeriod, deliveryDay, zone1charge, zone2charge, zone3charge, zone4charge, zone5charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
const values = [newstore.storeName, storeCategoryString, newstore.userID, newstore.storeDescription, image, newstore.storeDeliveryPeriod, deliveryDayString, newstore.zone1charge, newstore.zone2charge, newstore.zone3charge, newstore.zone4charge, newstore.zone5charge];
db.query(sql, values, (error, results, fields) => {
    if (error) {
    console.error(error);
    console.log("Failed to create store");
    return res.redirect('/sellerdashboard');
    }
    console.log("Store created successfully");
    return res.redirect('/sellerdashboard');
});

});

// Creating a new Product
app.post('/newproduct/:storeID', (req, res) => {
  let {storeID }= req.params;
  let image;
  if (!req.files || !req.files.productImage) {
      return res.status(400).send('No file uploaded');
    }
  else{
    image= req.files.productImage.data;
  }

  let newproduct= req.body;
  newproduct.storeID= session.userid;
  newproduct.creationDate= new Date().toJSON().slice(0, 10);;
  newproduct.storeID= storeID;
  console.log("newproduct", newproduct);
  console.log("image", image);
  // Add data to database
  console.log("About to create new product");

  const sql = 'INSERT INTO product (productName, productDescription, productCost, productCategory, storeID, productStock, dateCreated, productImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [newproduct.productName,newproduct.productDescription,newproduct.productCost,newproduct.productCategory,newproduct.storeID,newproduct.productStock,newproduct.creationDate,image];
  db.query(sql, values, (error, results, fields) => {
      if (error) {
      console.error(error);
      console.log("Failed to create product");
      return res.redirect('/storepage');
      }
      console.log("Store created successfully");
      return res.redirect(`/storepage/${storeID}`);
  });
});

// Add to Cart
app.post('/addToCart', (req, res) => {
  console.log("req.body", req.body);
  const pid = req.body.pid;
  const sid= req.body.sid;
  
  const quantity= 1;
  const userID= req.session.userid;
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
  if(req.session.loggedIn == true){

    console.log("About to add to cart");

  const sql = 'INSERT INTO cart (userID, productID, storeID, quantity, timestamp) VALUES (?, ?, ?, ?, ?)';
  const values = [userID, pid, sid, quantity, timestamp];
  db.query(sql, values, (error, results, fields) => {
      if (error) {
      console.error(error);
      console.log("Failed to add to cart");
      res.status(400).json({ error: 'Unable to add product to cart' });

      }
      console.log("Add to cart was successful");
      res.status(200).json({ message: 'Product added to cart successfully' });
    });
  }
  else{
    return res.redirect("/login");
  }
});



/*-----------------------PAGE ROUTES: GET METHODS------------------------- */
// Landing page route
app.get('/', (req, res) => {
    session=req.session;
    db.query('SELECT p.productID, p.productName, p.productCost, p.productDescription, p.productImage, s.storeID, s.storeName, s.storeImage FROM product p INNER JOIN store s ON p.storeID = s.storeID', function(error, results, fields) {
      if (error) {
        throw error;
      } else {
        console.log("Results", results);
        console.log("Results length", results.length);
              
        const products = results.map(product => ({
          productID: product.productID,
          productName: product.productName,
          productCost: product.productCost,
          productDescription: product.productDescription,
          productImage: `data:image/png;base64,${product.productImage.toString('base64')}`,
          storeID: product.storeID,
          storeName: product.storeName,
          storeImage: `data:image/png;base64,${product.storeImage.toString('base64')}`
        }));
              
        if (session.userid) {
          res.render('landing', { loggedIn: req.session.loggedIn, landingHome:true, products:products });
        } else {
          res.render('landing', { root: __dirname, landingHome:true, products:products });
        }
      }
    });
  });

  app.get('/landingstores', (req, res) => {
    session=req.session;
    db.query('SELECT storeID, storeName, storeCategory, storeImage  FROM store', function(error, results, fields) {
      if (error){
          throw error;
      }
      else{
          console.log("Results", results);
          console.log("Results length", results.length);
          const stores = results.map(store => ({
            storeID: store.storeID,
            storeName: store.storeName,
            storeCategory: store.storeCategory,
            storeImage: `data:image/png;base64,${store.storeImage.toString('base64')}`
          }));

          if(session.userid){
            res.render('landing', {loggedIn: req.session.loggedIn, landingStore:true, storeDetails:stores});
          }else{
              res.render('landing', { root: __dirname, landingStore:true, storeDetails:stores });
          }
      }
    });
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
  const sql = 'SELECT storeID, storeName, storeCategory, storeImage FROM store WHERE userID = ?';
  const values = [session.userid];
  db.query(sql, values, (err, results) => {
    if (err) throw err;
    const stores = results.map(store => ({
      id: store.storeID,
      name: store.storeName,
      category: store.storeCategory,
      image: `data:image/png;base64,${store.storeImage.toString('base64')}`
    }));
	res.render("sellerdashboard", {stores});

});
 
});

app.get("/storepage/:id", (req, res) => {
  let {id }= req.params;
  console.log("storeID", id);
  const sql = 'SELECT storeName, storeDescription, storeImage FROM store WHERE storeID = ?';
  const values = [id];

  db.query(sql, values, (err, results) => {
    if (err) throw err;
    //console.log("Results", results)
    //console.log("StoreName", results[0].storeName);
    //console.log("Results 0", results[0])
    let image= `data:image/png;base64,${results[0].storeImage.toString('base64')}`
    const storeinfo={ storeID:id, storeName:results[0].storeName, storeDescription:results[0].storeDescription, storeImage:image}
    

    const sql = 'SELECT productID, productName, productCost, productImage FROM product WHERE storeID = ?';
    const values = [id];
    db.query(sql, values, (err, results) => {
      if (err) throw err;
      const products = results.map(product => ({
        pid: product.productID,
        pname: product.productName,
        pcost: product.productCost,
        pimage: `data:image/png;base64,${product.productImage.toString('base64')}`
      }));

      res.render("storepage", {storeinfo, products, HomeTrue:true, storeID:id} );  
  });
  });

});

app.get("/storeorders/:id", (req, res) => {
  let {id }= req.params;
  console.log("storeID", id);

  const sql = 'SELECT * FROM store WHERE storeID = ?';
  const values = [id];

  db.query(sql, values, (err, results) => {
    if (err) throw err;
    //console.log("Results", results)
    //console.log("StoreName", results[0].storeName);
    //console.log("Results 0", results[0])
    let image= `data:image/png;base64,${results[0].storeImage.toString('base64')}`
    const storeinfo=results[0];
    storeinfo.storeImage= image;
    res.render("storepage", {storeinfo, OrdersTrue:true, storeID:id} );  

  });


});

app.get("/storesettings/:id", (req, res) => {
  let {id }= req.params;
  console.log("storeID", id);

  const sql = 'SELECT * FROM store WHERE storeID = ?';
  const values = [id];

  db.query(sql, values, (err, results) => {
    if (err) throw err;
    //console.log("Results", results)
    //console.log("StoreName", results[0].storeName);
    //console.log("Results 0", results[0])
    let image= `data:image/png;base64,${results[0].storeImage.toString('base64')}`
    const storeinfo=results[0];
    storeinfo.storeImage= image;
    const deliveryDaysArray = storeinfo.deliveryDay.split(',');
    const deliveryDaysObject = deliveryDaysArray.reduce((obj, day) => {
      obj[day] = true;
      return obj;
    }, {});
    storeinfo.deliveryDay= deliveryDaysObject;
    //console.log(storeinfo);
    res.render("storepage", {storeinfo, SettingsTrue:true, storeID:id} );  

  });

});

app.get("/visitstore/:id", (req, res) => {
  console.log("Inside visit store")
  let {id }= req.params;
    console.log("storeID", id);
    console.log("Inside vidit store")

  const sql = 'SELECT storeName, storeDescription, storeImage FROM store WHERE storeID = ?';
  const values = [id];

  db.query(sql, values, (err, results) => {
    if (err) throw err;
    console.log("Results", results)
    console.log("StoreName", results[0].storeName);
    console.log("Results 0", results[0])
    let image= `data:image/png;base64,${results[0].storeImage.toString('base64')}`
    const storeinfo={ storeID:id, storeName:results[0].storeName, storeDescription:results[0].storeDescription, storeImage:image}
    const sql = 'SELECT productID, productName, productCost, productImage, productDescription FROM product WHERE storeID = ?';
    const values = [id];
    db.query(sql, values, (err, results) => {
      if (err) throw err;
      const products = results.map(product => ({
        pid: product.productID,
        pname: product.productName,
        pcost: product.productCost,
        pimage: `data:image/png;base64,${product.productImage.toString('base64')}`, 
        pDescription: product.productDescription
      }));

      res.render("storeuserview", {storeinfo, products, storeID:id, loggedIn: req.session.loggedIn} );  
  });
  });
});

app.get("/viewcart/:storeID", (req, res) => {
  console.log("Inside app.get view cart")
  let {storeID}= req.params;
  let userID = req.session.userid;
  console.log("ourdata", storeID, userID);
  const sql = `
  SELECT c.cartID, c.quantity, p.productName, p.productCost 
  FROM cart c 
  JOIN product p ON c.productID = p.productID
  WHERE c.storeID = ? AND c.userID = ?
`;
const values = [storeID, userID];
db.query(sql, values, (err, results) => {
  if (err) throw err;

  // Calculate the total for each item
  results.forEach(item => {
    item.total = item.quantity * item.productCost;
  });
  console.log("Cart results", results);

  // Calculate the cart total
  const cartTotal = results.reduce((total, item) => total + item.total, 0);
  console.log("Cart total", cartTotal);


  // Render the cart view template with the retrieved data
  res.json({
    items: results,
    total: cartTotal
  });
});
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
  let scount = {};
  let pcount = {};


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
            const storecategories = results.map(result => result.storeCategory);

            storecategories.forEach(category => {
              if (scount[category]) {
                scount[category]++;
              } else {
                scount[category] = 1;
              }
            });


            console.log("StoreCount", storecount)
            console.log("Scount", scount)

            db.query('SELECT * FROM product', function(error, results, fields){
              if (error){
                throw error;
            }
            else{
                console.log("Results", results);
                console.log("Results length", results.length);
                productcount= results.length;
                const productcategories = results.map(result => result.productCategory);
                productcategories.forEach(category => {
                  if (pcount[category]) {
                    pcount[category]++;
                  } else {
                    pcount[category] = 1;
                  }
                });

                console.log("Product Count", productcount)
                console.log("Pcount", pcount)
                console.log("Scount", scount)


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


/*-----------------------SEARCH AND FILTER FUNCTIONALITY--------------------------------------*/
app.get('/searchproduct', function(req, res) {
  console.log("In server side search product")
  const searchTerm = req.query.search; 
  console.log("req.query", req.query)
  console.log("Search term", searchTerm)
  const sql = `SELECT p.productID, p.productName, p.productCategory, p.productCost, p.productImage, s.storeID, s.storeName, s.storeImage 
               FROM product p 
               INNER JOIN store s ON p.storeID = s.storeID 
               WHERE p.productName LIKE '%${searchTerm}%' OR p.productCategory LIKE '%${searchTerm}%'`; 

  db.query(sql, function(error, results, fields) {
    if (error) {
      throw error;
    } else {
      console.log("Results", results);
      console.log("Results length", results.length);
            
      const products = results.map(product => ({
        productID: product.productID,
        productName: product.productName,
        productCost: product.productCost,
        productImage: `data:image/png;base64,${product.productImage.toString('base64')}`,
        storeID: product.storeID,
        storeName: product.storeName,
        storeImage: `data:image/png;base64,${product.storeImage.toString('base64')}`
      }));
            
      if (session.userid) {
        res.render('landing', { loggedIn: req.session.loggedIn, landingHome:true, products:products, searchTerm:searchTerm});
      } else {
        res.render('landing', { root: __dirname, landingHome:true, products:products, searchTerm:searchTerm });
      }
    }
  });
});


app.get('/searchstore', function(req, res) {
  console.log("In server side search store")
  const searchTerm = req.query.search; 
  console.log("req.query", req.query)
  console.log("Search term", searchTerm)
  const sql = `SELECT storeID, storeName, storeCategory, storeImage
               FROM store
               WHERE storeName LIKE '%${searchTerm}%' OR storeCategory LIKE '%${searchTerm}%'`; 

  db.query(sql, function(error, results, fields) {
    if (error) {
      throw error;
    } else {
      console.log("Results", results);
      console.log("Results length", results.length);
            
      const stores = results.map(store => ({
        storeID: store.storeID,
        storeName: store.storeName,
        storeCategory: store.storeCategory,
        storeImage: `data:image/png;base64,${store.storeImage.toString('base64')}`
      }));

      console.log("Stores", stores)
            
      if (session.userid) {
        res.render('landing', { loggedIn: req.session.loggedIn, landingStore:true, storeDetails:stores, searchTerm:searchTerm});
      } else {
        res.render('landing', { root: __dirname, landingStore:true, storeDetails:stores, searchTerm:searchTerm });
      }
    }
  });
});


app.get('/filterproduct', function(req, res) {
  const category = req.query.category; 
  console.log("category", category);

  if(category== 'Explore'){
    res.redirect('/');
  }

  const sql = `SELECT p.productID, p.productName, p.productCost, p.productImage, s.storeID, s.storeName, s.storeImage 
               FROM product p 
               INNER JOIN store s ON p.storeID = s.storeID 
               WHERE p.productCategory = '${category}'`; 

  db.query(sql, function(error, results, fields) {
    if (error) {
      throw error;
    } else {
      console.log("Results", results);
      console.log("Results length", results.length);
            
      const products = results.map(product => ({
        productID: product.productID,
        productName: product.productName,
        productCost: product.productCost,
        productImage: `data:image/png;base64,${product.productImage.toString('base64')}`,
        storeID: product.storeID,
        storeName: product.storeName,
        storeImage: `data:image/png;base64,${product.storeImage.toString('base64')}`
      }));
            
      if (session.userid) {
        res.render('landing', { loggedIn: req.session.loggedIn, landingHome:true, products:products });
      } else {
        res.render('landing', { root: __dirname, landingHome:true, products:products });
      }
    }
  });
});

/*-----------------------DELETE AND EDIT FUNCTIONALITY--------------------------------------*/

/*----------------------- USER SIDE--------------------------------------*/
app.post('/updatestoreinfo/:storeID', (req, res) => {
  let {storeID}= req.params;
  let { updatedStore } = req.body;
  console.log("storeID", storeID)
  console.log("updatedStore", updatedStore)
  console.log(req.body);
  console.log( req.files);
  const updatedStoreinfo= req.body;
  console.log("Updated", updatedStoreinfo);
  let sql; 
  let values;
  if(Array.isArray(updatedStoreinfo.deliveryDay)){
    deliveryDayString = updatedStoreinfo.deliveryDay.join(',');
  }
  else{
    deliveryDayString = updatedStoreinfo.deliveryDay;
  }
  console.log("deliveryDay", deliveryDayString);

  if (!req.files || !req.files.storeImage) {
    console.log("No Image Uploaded")
    sql = 'UPDATE store SET storeName= ?, storeCategory= ?, storeDescription = ?, storeDeliveryPeriod= ? , deliveryDay = ?, zone1charge = ? , zone2charge = ? , zone3charge = ? , zone4charge = ? , zone5charge = ? WHERE storeID = ?' ;
    values = [updatedStoreinfo.storeName, updatedStoreinfo.storeCategory, updatedStoreinfo.storeDescription,updatedStoreinfo.originalStoreDeliveryPeriod, deliveryDayString, updatedStoreinfo.zone1charge, updatedStoreinfo.zone2charge, updatedStoreinfo.zone3charge, updatedStoreinfo.zone4charge, updatedStoreinfo.zone5charge, storeID];

  }
else{
  console.log("Image Uploaded")
  let image= req.files.storeImage.data;
  sql = 'UPDATE store SET storeName= ?, storeCategory= ?, storeDescription = ?, storeImage = ?, storeDeliveryPeriod= ? , deliveryDay = ?, zone1charge = ? , zone2charge = ? , zone3charge = ? , zone4charge = ? , zone5charge = ?  WHERE storeID = ?';
    values = [updatedStoreinfo.storeName, updatedStoreinfo.storeCategory, updatedStoreinfo.storeDescription, image , updatedStoreinfo.storeDeliveryPeriod, deliveryDayString, updatedStoreinfo.zone1charge, updatedStoreinfo.zone2charge, updatedStoreinfo.zone3charge, updatedStoreinfo.zone4charge, updatedStoreinfo.zone5charge, storeID];
}
 
  db.query(sql, values, (error, results, fields) => {
    if (error) {
    console.error(error);
    console.log("Failed to update store information");
    return res.redirect(`/storesettings/${storeID}`);
    }
    console.log("User updated successfully");
    return res.redirect(`/storesettings/${storeID}`);
  });

});




/*----------------------- ADMIN TABLES--------------------------------------*/
/* --------- Deleting records --------*/
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


/*---Admin: Updating User, Stores and Products---- */

// Updating User Details
app.post('/updateuserstable/:userID', (req, res) => {
  console.log("Inside user update post method");
  let {userID }= req.params;
  console.log("User ID", userID);
  let { updatedUserName } = req.body;
  console.log("Updated Information", updatedUserName);

   // Updating UserName
   console.log("About to update user name");
   const sql = 'UPDATE user SET userName = ? WHERE userID = ?';
   const values = [updatedUserName, userID];
   db.query(sql, values, (error, results, fields) => {
       if (error) {
       console.error(error);
       console.log("Failed to update user information");
       return res.redirect('/userstable');
       }
       console.log("User updated successfully");
       return res.redirect('/userstable');
   });

});


// Updating Store Details
app.post('/updatestorestable/:storeID', (req, res) => {
  console.log("Inside store update post method");
  let {storeID }= req.params;
  console.log("Store ID", storeID);
  let { updatedStoreName, updatedStoreCat} = req.body;
  console.log("Updated Information", updatedStoreName, updatedStoreCat );

  // Updating Store Information
  console.log("About to update store info");
  const sql = 'UPDATE store SET storeName = ? , storeCategory =? WHERE storeID = ?';
  const values = [updatedStoreName, updatedStoreCat, storeID ];
  db.query(sql, values, (error, results, fields) => {
      if (error) {
      console.error(error);
      console.log("Failed to update store information");
      return res.redirect('/storestable');
      }
      console.log("User updated successfully");
      return res.redirect('/storestable');
  });

});

// Updating Product Details
app.post('/updateproductstable/:productID', (req, res) => {
  console.log("Inside product update post method");
  let {productID }= req.params;
  console.log("Product ID", productID);
  let { updatedProductName, updatedProductCat, updatedProductPrice } = req.body;
  console.log("Updated Information", updatedProductName, updatedProductCat, updatedProductPrice);

  // Updating UserName
  console.log("About to update product info");
  const sql = 'UPDATE product SET productName = ? , productCategory = ? , productCost = ? WHERE productID = ?';
  const values = [updatedProductName, updatedProductCat, updatedProductPrice, productID];
  db.query(sql, values, (error, results, fields) => {
      if (error) {
      console.error(error);
      console.log("Failed to update product information");
      return res.redirect('/productstable');
      }
      console.log("Product updated successfully");
      return res.redirect('/productstable');
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