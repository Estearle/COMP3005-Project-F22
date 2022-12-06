const express = require('express');
const fs = require("fs");
const app = express();
const {Pool, Client} = require("pg");

const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files

//Provide static server
app.use(express.static(__dirname + ROOT_DIR_JS));

//Convert any JSON stringified strings in a POST request to JSON.
app.use(express.json())

//Setting pug as our template engine
app.set('views','./views');
app.set('view engine','pug');



//Login Page
app.get('/',(req,res)=>{
    res.render('login');
})

// Loads all the books 
// Search 
app.get('/books',(req,res)=>{
    res.render('books',{})
})

//Cart
app.get('order',(req,res)=>{
    res.render('order',{});
})


// Report
app.get('/report',(req,res)=>{
    res.render('report',{});
})





//connect server


const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '‘password’ ',
  port: 5433,
  // ssl  : {
  //   ca : fs.readFileSync('<path to CA cert file>')
  // }
})
client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

