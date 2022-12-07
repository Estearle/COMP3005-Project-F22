const express = require('express');
const fs = require("fs");
const app = express();
const {Pool, Client} = require("pg");
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
  res.status(200).render('login');
})

// Loads all the books 
// Search 
app.get('/books',(req,response)=>{
  client.query('SELECT * FROM public.books',(err,res)=>{
    if(err){
      response.status(404);
      console.log(err);
    }
    books = res.rows;
    //response.status(200).render('books',{books,books});
    for (let book of books){
      book.genre = [];
      book.author = [];
    }
    //store the corresponding genre and authors
    //genre and authors can be more than one -> use array to store
    //book author:
    for (let book of books){
      client.query(`SELECT author FROM bookauthors WHERE bookauthors.isbn='${book.isbn}'`,(err,res)=>{
        if(err){
          response.status(404);
          console.log(err);
        }
        res.rows.forEach(row=>{
          for(let key in row){
            if(!book.author.includes(row[key])){
              book.author.push(row[key]);
            }}})})}
    //book genre
    for (let book of books){
        client.query(`SELECT genre FROM bookgenres WHERE bookgenres.isbn='${book.isbn}'`,(err,res)=>{
        if(err){
          response.status(404);
          console.log(err);
        }
        res.rows.forEach(row=>{
          for(let key in row){
            if(!book.genre.includes(row[key])){
              book.genre.push(row[key]);
            }
          }
        })
        console.log(books);  
        //response.status(200).render('books',{books,books});
      })
    }
    })})

  

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
        console.log(element);
        client.query(`INSERT INTO bookauthors (isbn,author) VALUES ($1, $2)`, [newBook.isbn, element], (err, res) => {
          if(err){
            console.log("could not add authors to database");
          } else {

            console.log("bookauthors: " + element);
            console.log("author added");
            // start of bookgenres insert
            gArray.forEach(element => {
              console.log(element);
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


// Cart Page
app.get('order',(req,res)=>{
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


function getBookGenre(isbn) {
  let getGenres;
  if (isbn != null) {
    client.query(`SELECT genre FROM public.bookgenres WHERE isbn='${isbn}'`,(err,r)=>{
      if(err){
        response.status(404);
      }
      getGenres = r.rows;
      console.log(getGenres);
      return genre;
    })
  }
  client.query('SELECT * FROM public.bookgenres',(err,res)=>{
    if(err){
      response.status(404);
    }
    getGenres = r.rows;
    console.log(getGenres);
    return genre;
  }) 
}

function getBookAuthor(isbn) {
  let getAuthors;
  if (isbn != null) {
    client.query(`SELECT genre FROM public.bookauthors WHERE isbn='${isbn}'`,(err,r)=>{
      if(err){
        response.status(404);
      }
      getAuthors = r.rows;
      console.log(getAuthors);
      return genre;
    })
  }
  client.query('SELECT * FROM public.bookauthors',(err,res)=>{
    if(err){
      response.status(404);
    }
    getAuthors = r.rows;
    console.log(getGenres);
    return genre;
  }) 
}