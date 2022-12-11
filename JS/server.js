// import express from 'express';
const express = require('express');
const app = express();
const fs = require("fs");
const {Pool, Client} = require("pg");
// import session from 'express-session';
//Setting up the express sessions to be stored in the database
// app.use(session({
//   store: new(require('express-pg-session')(session))(),
//   secret: "top secret key",
//   resave: true,
//   saveUninitialized:false,
// }))
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
  res.status(200).render('login',{session:req.session});
})

// Saving the user registration to the database.
app.post("/register", async (req, res) => {

  let newUser = req.body;
  try{
      const searchResult = await client.query(`SELECT`)
      if(searchResult == null) {
          console.log("registering: " + JSON.stringify(newUser));
          await User.create(newUser);
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

let username = req.body.username;
let password = req.body.password;

  try {
      const searchResult = await User.findOne({ username: username });
      if(searchResult != null) { 
          if(searchResult.password === password) {
              // If we successfully match the username and password
              // then set the session properties.  We add these properties
              // to the session object.
              req.session.loggedin = true;
              req.session.username = searchResult.username;
              req.session.userid = searchResult._id;
              res.render('pages/home', { session: req.session })
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

// Loads all the books 
// Search 
app.get('/books',async(req,response)=>{
  let {rows} = await client.query('SELECT * FROM public.books');
  let searchGenre = await client.query('SELECT * FROM bookgenres');
  let genreResult = searchGenre.rows;
  let searchAuthor = await client.query('SELECT * FROM bookauthors');
  let authorResult = searchAuthor.rows;
  // console.log(rows);
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
app.get('/books/:ISBN',(req,response)=>{
  let obj_id = req.params.ISBN;
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
      response.status(200).render('book',{book:book,genre:genre});
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
  
  if (orders !== null) {
    for (let book in orders) {
      for (item in cart) {
        if (item.isbn == book.isbn) {
          item.add += book.add;
          break;
        } else {
          cart[book] = orders[book];
        }
      }
    }
    console.log("==========================CART UPDATE==========================")
    console.log(cart);
    res.status(200).send();
  } else {
    res.status(500).send();
  }
})

// Cart Page
app.get('/order',(req,res)=>{
  res.render('order',{});
})


// Reports Pages
app.get('/report',(req,res)=>{
  res.render('report',{});
})


// Owner Home Page
app.get('/owner', (req,res) => {
  res.render('owner',{});
})