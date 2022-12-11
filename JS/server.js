// import express from 'express';
const express = require('express');
const app = express();
const fs = require("fs");
const {Pool, Client} = require("pg");

const session = require('express-session');

// import session from 'express-session';
//Setting up the express sessions to be stored in the database
app.use(session({
  secret: "top secret key",
  resave: true,
  saveUninitialized:false,
}))
const logger = require('morgan');
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));
// import logger from 'morgan';

const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files
let books;
//Provide static server
app.use(express.static(__dirname + ROOT_DIR_JS));

//Convert any JSON stringified strings in a POST request to JSON.
app.use(express.json())

//Setting pug as our template engine
app.set('views','./views');
app.set('view engine','pug');

//connect server
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
})

client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  app.listen(PORT);
  console.log("Server listening on port 3000");
});

//Login Page
app.get('/',(req,res)=>{
  res.status(200).render('login',);
})

app.get('/logout',(req,res)=>{
  if(req.session.loggedin){
    req.session.loggedin = false;
  }
  res.redirect(`/`);
})

// Saving the user registration to the database.
app.post("/register", async (req, res) => {
  let newUser = req.body;
  try{
      const searchResult = await client.query(`SELECT * FROM customers WHERE customers.uname='${newUser.username}'`);
      console.log(searchResult.rows);
      console.log(searchResult.rows.length)
      if(searchResult.rows.length === 0) {
          console.log("registering: " + JSON.stringify(newUser));
          await client.query(`insert into customers values('${newUser.username}','${newUser.password}','${newUser.firstname}','${newUser.lastname}', '${newUser.username}@mail.com' , '${newUser.billing}' , '${newUser.shipping}')`)
          console.log("DONE");
          res.status(200).send();
      } else {
          console.log("Send error.");
          res.status(404).json({'error': 'Exists'});
      }
  } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Error registering" });
  }  

});

// Search the database to match the username and password .
app.post("/login", async (req, res) => {
console.log("LOGIN");

let username = req.body.username;
let password = req.body.password;

  try {
      const {rows} = await client.query(`SELECT * FROM customers WHERE customers.uname='${username}'`);
      console.log(rows);
      if(rows != null) {
        if(rows[0].password === password) {
            // If we successfully match the username and password
            // then set the session properties.  We add these properties
            // to the session object.
            req.session.loggedin = true;
            req.session.username = rows[0].uname;
            res.redirect('/welcome');
        } else {
            res.status(401).send("Not authorized. Invalid password.");
        }
      } else {
        res.status(401).send("Not authorized. Invalid password.");
      }
  } catch(err) {
      console.log(err);
      res.status(500).json({ error: "Error logging in."});
  }    

});

app.get("/welcome",(req,res)=>{
  res.render("welcome");
})

//Tracking number
app.get("/tracking",(req,res)=>{
  res.render("tracking");
})


// Loads all the books 
// Search 
app.get('/books',async(req,response)=>{
  let {rows} = await client.query('SELECT * FROM public.books');
  let searchGenre = await client.query('SELECT * FROM bookgenres');
  let genreResult = searchGenre.rows;
  let searchAuthor = await client.query('SELECT * FROM bookauthors');
  let authorResult = searchAuthor.rows;
  books = rows;

  books.forEach(book => {
    let genres = [];
    genreResult.forEach(element => {
      if (element.isbn == book.isbn) {
        genres.push(element.genre);
      }
    })
    book['genre'] = genres;
  });

  books.forEach(book => {
    let authors = [];
    authorResult.forEach(element => {
      if (element.isbn == book.isbn) {
        authors.push(element.author);
      }
    })
    book['author'] = authors;
  });
  response.status(200).render('books',{books:books});    

})

// Specific Book Page
app.get('/books/:ISBN',async(req,response)=>{
  let obj_id = req.params.ISBN;
  let {rows} = await client.query(`SELECT * FROM public.books WHERE isbn='${obj_id}'`);
  let b = rows;
  console.log(b[0]);
  let searchGenre = await client.query(`SELECT genre FROM public.bookgenres WHERE isbn='${obj_id}'`);
  let genreResult = searchGenre.rows;
  console.log(genreResult);
  let searchAuthor = await client.query(`SELECT author FROM bookauthors WHERE isbn='${obj_id}'`);
  console.log(searchAuthor.rows[0].author);

  let book,genre;
  client.query(`SELECT * FROM public.books WHERE isbn='${obj_id}'`,(err,res)=>{
    if(err){
      response.status(404);
    }
    book = res.rows;
    client.query(`SELECT genre FROM public.bookgenres WHERE isbn='${obj_id}'`,(err,r)=>{
      if(err){
        response.status(404);
      }
      genre = r.rows;
      response.status(200).render('book',{book:b,genre:genre,author:searchAuthor.rows});
    })
  })  
})
  
// Add Book Page
app.get("/add",(req,response)=>{
  let publishers, authors, genres;
  client.query('SELECT * FROM public.publishers',(err,res)=>{
    if(err){
      response.status(404);
    }
    publishers = res.rows;
    client.query('SELECT * FROM public.authors',(err,res)=>{
      if(err){
        response.status(404);
      }
      authors = res.rows;
      client.query('SELECT * FROM public.genres',(err,res)=>{
        if(err){
          response.status(404);
        }
        genres = res.rows;
        response.status(200).render('add',{publishers:publishers, authors:authors, genres:genres});
      });
    });
  }); 
 })

 // Add Book request
app.post('/books/:ISBN',(req,response)=>{
  let newBook = req.body;
  console.log("checking newBook in server");
  console.log(JSON.stringify(newBook));
  
  let authors = newBook.author;
  aArray = authors.split(", ");

  let genres = newBook.genre;
  gArray = genres.split(", ");

  // query for adding into books relation
  let query = {
    text:'INSERT INTO books(isbn,bookname,pages,price,stock,numbersold,publisher,cost,percentsales) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    values:[newBook.isbn, newBook.bookname, newBook.pages, newBook.price, newBook.stock, 0, newBook.publisher, newBook.cost, newBook.psales],
  }

  console.log("query");
  
  // start of books insert
  client.query(query,(err,res)=>{
    if(err){
      console.log("could not add book to database");
    } else {
      console.log("books added");

      // start of bookauthors insert
      aArray.forEach(element => {
        // console.log(element);
        client.query(`INSERT INTO bookauthors (isbn,author) VALUES ($1, $2)`, [newBook.isbn, element], (err, res) => {
          if(err){
            console.log("could not add authors to database");
          } else {

            console.log("bookauthors: " + element);
            console.log("author added");
            // start of bookgenres insert
            gArray.forEach(element => {
              // console.log(element);
              client.query(`INSERT INTO bookgenres (isbn,genre) VALUES ($1, $2)`, [newBook.isbn, element], (err, res) => {
                if(err){
                  console.log(err);
                  console.log("could not add genre to database");
                  response.status(500).send();
                } else {
                  console.log("bookgenres: " + element);
                  console.log("genre added");
                  console.log("successfully added information to database");
                  response.status(200).send();
                } // end of bookgenres insert
              });
            });

          } // end of bookauthors insert
        });
      });

    } // end of books insert
  })
})

let cart = {};

// Add to cart post
app.post('/books', (req,res) => {
  let orders = req.body;
  let response = "";
  let stock = false;
  if (orders !== null) {
    for (let book in orders) {
      if (!cart.hasOwnProperty(book)) {
        cart[book] = orders[book];
      } else if (cart[book].add + orders[book].add > stock) {
        response = "Could not add an item to cart due to exceeding stock number, please check your order again";
        stock = true;
      } else {
        cart[book].add += orders[book].add;
      }
    }
    console.log("==========================CART UPDATE==========================")
    console.log(cart);
    res.status(200).send();
  } else if (stock) {
    res.status(400).send(response);
  } else {
    res.status(500).send();
  }
})

// Cart Page
app.get('/order',(req,res)=>{
  res.render('order',{cart:cart});
})

app.post('/order', (req,res)=>{
  let final_cart = req.body;
  if (final_cart !== null) {
    cart = final_cart;
    console.log("==========================CART SUBMIT==========================")
    console.log(cart);
    res.status(200).send();
  } else {
    res.status(500).send();
  }
})

app.put('/order', (req,res)=>{
  let del_list = req.body;
  if (del_list !== null) {
    for (let item in del_list) {
      delete cart[item];
    }
    console.log(cart);
  }
  res.render('order',{cart:cart})
})

app.get("/final", async (req,res)=>{
  const {rows} = await client.query(`SELECT * FROM public.customers WHERE customers.uname='${req.session.username}'`);
  if(rows != null) {
    let info = rows[0];
    delete info['password'];
    console.log(info);
    res.render("final", {cart:cart,info:info});
  } else {
    res.status(500).send();
  }
})

app.post("/final", async (req,response) =>{
  let info = req.body;
  let books = info["cart"];
  console.log(books);

  const {rows} = await client.query(`SELECT * FROM public.orders`);
  let newOrderNum = parseInt(rows[rows.length-1].ordernumber) + 1;

  let tracking = '';
  let unique = true;
  do {
    tracking = generateTracking(10);
    for (let i = 0; i < rows.length-1; i++) {
      if(tracking === rows[i].trackinginfo) {
        unique = false;
      }
    }
  } while (unique === false);
  
  let query = {
    text:'INSERT INTO orders(ordernumber,billinginfo,shippinginfo,trackinginfo,customer) VALUES($1,$2,$3,$4,$5)',
    values:[newOrderNum, info["user"].billinginfo, info["user"].shippinginfo, tracking, info["user"].uname],
  }

  client.query(query,(err,res)=>{
    if(err){
      console.log("could not add order to database");
    } else {
      console.log("order added to database");
      for (let id in books) {
        console.log(id);
        client.query(`INSERT INTO bookorders(ordernumber, isbn, numbersold) VALUES($1,$2,$3)`,[newOrderNum,id,books[id].add], (err,re)=>{
          if(err) {
            console.log("could not add bookorder to database");
          } else {
            console.log("added ordernumber to database");
            cart = {};
            console.log(cart);
            response.status(200).send(tracking);
          }
        })
      };
    }
  })
  
})


function generateTracking() {
  let tracking = '';
  let t_length = 10;
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let i = 0; i < t_length; i++) {
    tracking += (characters.charAt(Math.floor(Math.random()*characters.length)))
  }
  return tracking;
}

// Reports Pages
app.get('/report',(req,res)=>{
  res.render('report',{});
})

// Owner Home Page
app.get('/owner', (req,res) => {
  res.render('owner',{});
})


//owner login
app.post("/owner",(req,res)=>{
  let username = req.body.username;
  let password = req.body.password;
  console.log(username + " "+password +" "+JSON.stringify(req.body))
  try {
    if(username === "owner") { 
        if(password === "owner") {
            req.session.loggedin = true;
            req.session.username = username;
            res.render('ownerWelcome')
        } else {
            res.status(401).send("Not authorized. Invalid password.");
        }
    } else {
        res.status(401).send("Not authorized. Invalid password.");
    }
} catch(err) {
    console.log(err);
    res.status(500).json({ error: "Error logging in."});
}    
})

//owner's welcome page
app.get("/ownerWelcome",(req,res)=>{
  res.render("ownerWelcome");
})
//owner logout
app.get('/ownerlogout',(req,res)=>{
  if(req.session.loggedin){
    req.session.loggedin = false;
  }
  res.redirect(`/owner`);
})
//owner's side
app.get("/ownerBooks", async(req,response)=>{
  let {rows} = await client.query('SELECT * FROM public.books');
  let searchGenre = await client.query('SELECT * FROM bookgenres');
  let genreResult = searchGenre.rows;
  let searchAuthor = await client.query('SELECT * FROM bookauthors');
  let authorResult = searchAuthor.rows;
  books = rows;

  books.forEach(book => {
    let genres = [];
    genreResult.forEach(element => {
      if (element.isbn == book.isbn) {
        genres.push(element.genre);
      }
    })
    book['genre'] = genres;
  });

  books.forEach(book => {
    let authors = [];
    authorResult.forEach(element => {
      if (element.isbn == book.isbn) {
        authors.push(element.author);
      }
    })
    book['author'] = authors;
  });
  response.status(200).render('ownerbooks',{books:books});  
})

//DELETE 
app.delete('/ownerBooks/:id',async(req,res)=>{
  console.log("DELETE USER");
  console.log(req.params.id);
  let isbn = req.params.id;
  await client.query(`DELETE FROM bookorders WHERE isbn='${isbn}'`);
  await client.query(`DELETE FROM bookauthors WHERE isbn='${isbn}'`);
  await client.query(`DELETE FROM bookgenres WHERE isbn='${isbn}'`);
  await client.query(`DELETE FROM books WHERE isbn='${isbn}'`);
  console.log("SUCCESS");
  res.send();
})
