let search = document.getElementById("search");
let searchB = document.getElementById("searchB");
if(searchB !== null) {
    searchB.onclick = searchFunction;
}
let addCartB = document.getElementById("addCart");
console.log(addCartB);
if (addCartB !== null) {
    addCartB.onclick = addCartFunction;
}


let list = document.getElementsByClassName("search");;
console.log(list);
// for(let i = 0; i < allBooks.length; i++) {
    
// };


let cart = {};
let item = {};

function addCartFunction(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() { 
        if (this.readyState == 4 && this.status == 200) {
            console.log("Success!");
            console.log();
            window.location.href = '/order';
        }
    }
    if (window.location.href == "http://localhost:3000/books") {
        let allBooks = document.getElementsByClassName("search");
        for(let i = 0; i < allBooks.length; i++) {
            if(allBooks[i].checked) {
                let book = JSON.parse(allBooks[i].name);
                console.log(book);
                if (allBooks[i].getAttribute("in_cart") == "yes") {
                    // increase "in_cart" attribute by 1;
                } else {
                    allBooks[i].setAttribute("in_cart", "yes");
                    item = {"isbn": book.isbn, "name": book.bookname, "add": 1, "stock": parseInt(book.stock), "sold": parseInt(book.numbersold), "genre": book.genre, "author": book.author};
                    cart[book.isbn] = item;
                }
                
            }
        };
    } else {
        let book = JSON.parse(((document.getElementsByTagName("p"))[0].getAttribute("name")));
        let amount = document.getElementById("add").value;
        item = {"isbn": book.isbn, "name": book.bookname, "add": parseInt(amount), "stock": parseInt(book.stock), "sold": parseInt(book.numbersold), "genre": book.genre, "author": book.author};
        cart[book.isbn] = item;
    }
    console.log(cart);
    xhttp.open("POST", `/books`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(cart));
}

function searchFunction(){
    console.log("SEARCHING!")
    let search = document.getElementById("search").value;
    if(search.length !== 0){

        let allBooks = document.getElementsByClassName("search");
        let books = [];
        
        let searchInfo = search.toLowerCase().split(" ").filter(function(token) {return token.trim() !== ''});

        let searchInfoRegex = new RegExp(searchInfo.join('|'), 'gim');
        for(let i = 0; i < allBooks.length; i++) {
            let bookInfo = JSON.parse(allBooks[i].name);
            books.push(bookInfo);
            allBooks[i].style.display = "none";
            let label = document.getElementById(bookInfo.isbn);
            label.style.display = "none";
        };
        console.log("books");
        console.log(books);
        let bookMatch = books.filter(function(element){
            let bookSearch = '';
            for(let key in element) {
                if(element.hasOwnProperty(key) && element[key] != '' && (key === 'bookname' || key === 'publisher' || key === 'genre' || key === 'author')) {
                    bookSearch += element[key].toString().toLowerCase().trim()+' ';
                }
            }
            return bookSearch.match(searchInfoRegex);
        })
        console.log(bookMatch);
        
        for (let book of bookMatch) {
            for(let i = 0; i < allBooks.length; i++) {
                let bookInfo = JSON.parse(allBooks[i].name);
                if (bookInfo.isbn == book.isbn){
                    console.log("found matching book!");
                    allBooks[i].style.display = "";
                    let label = document.getElementById(bookInfo.isbn);
                    label.style.display = "";
                    break;
                }
            } 
        };
    } else {
        window.location.href = '/books';
        return;
    }
}