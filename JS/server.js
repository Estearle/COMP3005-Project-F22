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

let first = true;

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
            first = false;
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
  if (first) {
    res.redirect(`/`);
  }
  res.render("welcome");
})

//Tracking number
app.get("/tracking",(req,res)=>{
  if (first) {
    res.redirect(`/`);
  }
  res.render("tracking");
})


// Loads all the books 
// Search 
app.get('/books',async(req,response)=>{
  if (first) {
    response.redirect(`/`);
  }
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
  if (first) {
    response.redirect(`/`);
  }
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

// Add Book PUT request to update the number of stock - button only visible when under the threshold set 
app.put('/books/:ISBN',async(req,response)=>{
  let isbn = req.body;
  client.query(`UPDATE books SET stock = stock + 20 WHERE isbn = '${isbn}'`, (err, res)=> {
    if(err) {
      console.log("failed to update: " + isbn);
      console.log(err);
    } else {
      console.log("Added 20 books to stock of: " + isbn);
      response.status(200).send("Added 20 books to stock of: " + isbn);
    }
  })
})

// Add Book Page
app.get("/add",(req,response)=>{
  if (first) {
    response.redirect(`/`);
  }
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
  if (first) {
    res.redirect(`/`);
  }
  res.render('order',{cart:cart});
})

// Add Items to cart POST /order request
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

// Remove Items from cart PUT /order request
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

// Get Logged In User info to have data on finalize order page
app.get("/final", async (req,res)=>{
  if (first) {
    res.redirect(`/`);
  }
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

// POST /final request to finalize order with all the appropriate information
app.post("/final", async (req,response) =>{
  let info = req.body;
  let books = info["cart"];

  let restock = false;

  const {rows} = await client.query(`SELECT * FROM public.orders`);
  let newOrderNum = parseInt(rows[rows.length-1].ordernumber) + 1;

  let tracking = '';
  let unique = true;
  // create a unique tracking number
  do {
    tracking = generateTracking(10);
    for (let i = 0; i < rows.length-1; i++) {
      if(tracking === rows[i].trackinginfo) {
        unique = false;
      }
    }
  } while (unique === false);
  // create the query for user information
  let query = {
    text:'INSERT INTO orders(ordernumber,billinginfo,shippinginfo,trackinginfo,customer) VALUES($1,$2,$3,$4,$5)',
    values:[newOrderNum, info["user"].billinginfo, info["user"].shippinginfo, tracking, info["user"].uname],
  }
  // add to the information to orders database
  client.query(query,(err,res)=>{
    if(err){
      console.log("could not add order to database");
    } else {
      console.log("order added to database");
      console.log(books);
      // add to bookorders database 
      for (let id in books) {
        console.log(id);
        client.query(`INSERT INTO bookorders(ordernumber, isbn, numbersold) VALUES($1,$2,$3)`,[newOrderNum,id,books[id].add], (err,res)=>{
          if(err) {
            console.log("could not add bookorder to database");
          } else {
            console.log("added ordernumber to database");
          }
        })
        let stock = books[id].stock - books[id].add;
        let sold = books[id].sold + books[id].add;

        if (stock < 20) {
          restock = 'true';
        }
        // update the books relation with new stock, number sold and if need to restock
        console.log("===================" + id + "===================");
        console.log("stock: " + stock + " sold: " + sold + " restock: " + restock);
        client.query(`UPDATE books SET stock = '${stock}', numbersold = '${sold}', restock = '${restock}' WHERE isbn = '${id}'`, (err, res)=> {
          if(err) {
            console.log("failed to update book");
          } else {
            console.log("updated book")
          }
        })

        let genres = books[id].genre;
        let authors = books[id].author;    
        // update the genre sales values in genres relation
        for (let i = 0; i < genres.length; i++) {
          client.query(`UPDATE genres SET sales = sales + '${books[id].add}', totalsales = totalsales + '${books[id].add * books[id].price}' WHERE genre = '${genres[i]}'`, (err, res)=> {
            if(err) {
              console.log("failed to update: " + genres[i]);
              console.log(err);
            }
          })
        }
        // update the author sales values in authors relation
        for (let i = 0; i < authors.length; i++) {
          client.query(`UPDATE authors SET sales = sales + '${books[id].add}', totalsales = totalsales + '${books[id].add * books[id].price}' WHERE author = '${authors[i]}'`, (err, res)=> {
            if(err) {
              console.log("failed to update: " + authors[i]);
              console.log(err);
            }
          })
        }
      };
      response.status(200).send(tracking);
    }
  })
  
})

// helper function to generate tracking
function generateTracking() {
  let tracking = '';
  let t_length = 10;
  const characters = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let i = 0; i < t_length; i++) {
    tracking += (characters.charAt(Math.floor(Math.random()*characters.length)))
  }
  return tracking;
}

// Reports Pages
app.get("/report",(req,res)=>{
  res.render('report',{});
})

// GET /finances page request to show all the expenditures
app.get("/finances",async (req,res)=>{
  let {rows} = await client.query('SELECT * FROM public.books');
  let data = rows;
  console.log(data);
  // create expenditures calculations
  data.forEach(book=> {
    book["expenses"] = ((parseInt(book['stock'])+parseInt(book['numbersold']))*parseFloat(book['cost'])).toFixed(2);
    book["sales"] = (parseInt(book['numbersold'])*parseFloat(book['price'])).toFixed(2);
    book["publisher_earnings"] = (parseFloat(book["sales"])*parseFloat(book["percentsales"])/100).toFixed(2);
    book["profit"] = (parseFloat(book["sales"]) - parseFloat(book["publisher_earnings"]) - parseFloat(book["expenses"])).toFixed(2);
  })
  res.render('finances',{data,data});
})

// show all the sales for each genre
app.get("/genres", async (req,res)=>{
  let {rows} = await client.query('SELECT * FROM public.genres');
  let genres = rows;
  console.log(genres);
  res.render('genres',{data:genres});
})

// show all the sales for each author
app.get("/authors", async(req,res)=>{
  let {rows} = await client.query('SELECT * FROM public.authors');
  let authors = rows;
  console.log(authors);
  res.render('authors',{data:authors});
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

app.post("/tracking/:trackingnum",async(req,res)=>{
  console.log("tracking...");
  let track = req.params.trackingnum;
  console.log(track);
  const searchResult = await client.query(`SELECT * FROM orders WHERE TrackingInfo='${track}'`);
  console.log("SUCCESS:"+JSON.stringify(searchResult.rows));
  res.json(searchResult.rows);
})