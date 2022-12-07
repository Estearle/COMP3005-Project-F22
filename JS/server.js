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
//
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
      respopnse.status(404);
    }
    console.log(res.rows);
    books = res.rows;
    response.status(200).render('books',{books,books});
  })
  
})

//Specific Books(GET)
app.get('/books/:ISBN',(req,response)=>{
  let obj_id = req.params.ISBN;
  let book,genre;
  client.query(`SELECT * FROM books WHERE isbn='${obj_id}'`,(err,res)=>{
    if(err){
      response.status(404);
    }
    book = res.rows;
    client.query(`SELECT genre FROM bookgenres WHERE isbn='${obj_id}'`,(err,r)=>{
      if(err){
        response.status(404);
      }
      genre = r.rows;
      response.status(200).render('book',{book:book,genre:genre});
    })
    console.log(book)
    console.log("GENRE:"+genre)
    
  })  
})
  
//add book
app.get("/add",(req,res)=>{
  res.render("add");
})

app.post('/books/:ISBN',(req,response)=>{
  let newBook = req.body;
  console.log("checking newBook in server");
  console.log(JSON.stringify(newBook));

  let query = {
    text:'INSERT INTO books (ISBN,BookName,Pages,Price,Stock,NumberSold,Publisher,Cost,PercentSales) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    values:[newBook.isbn, newBook.bookname, newBook.pages, newBook.price, newBook.stock, 0, newBook.publisher, newBook.cost, newBook.psales]
  }

  let authors = newBook.author;
  aArray = authors.split(", ");
  let aList = [];
  aArray.forEach(element => {
    console.log(element);
    aList.push([newBook.isbn, element]);
  });
  let aQuery = `INSERT INTO bookauthors (ISBN,Author) SELECT ${newBook.isbn} AS ISBN, UNNEST(ARRAY${aList} AS Author;`
  
  let genres = newBook.genre;
  gArray = genres.split(", ");
  let gList = [];
  gArray.forEach(element => {
    console.log(element);
    gList.push([newBook.isbn, element]);
  });
  let gQuery = `INSERT INTO bookgenres (ISBN,Genres) SELECT ${newBook.isbn} AS ISBN, UNNEST(ARRAY${gList} AS Genres;`

  console.log("query");
  client.query(query,(err,res)=>{
    if(err){
      response.status(500);
      console.log(res);
    } else {
      console.log("books added");
      console.log(res);
      response.status(200);
    }
  })
  
  console.log("authors");
  client.query(aQuery,(err,res)=>{
    if(err){
      response.status(500);
      console.log(res);
    } else {
      console.log("authors added");
      console.log(res);
      response.status(200);
    }
  })
  
  console.log("genre");
  client.query(gQuery,(err,res)=>{
    if(err){
      response.status(500);
      console.log(res);
    }  else {
      console.log("genres added");
      console.log(res);
      response.status(200);
    }
  })
  console.log("success");
  response.status(200);
  response.json({});
})


//Cart
app.get('order',(req,res)=>{
    res.render('order',{});
})


// Report
app.get('/report',(req,res)=>{
    res.render('report',{});
})






