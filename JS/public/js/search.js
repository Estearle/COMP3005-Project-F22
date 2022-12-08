let addCart = document.getElementById("addCart");
addCart.onlick = addCartFunction;
let search = document.getElementById("search");
let searchB = document.getElementById("searchB");
if(searchB !== null) {
    searchB.onclick = searchFunction;
}

let cart = [];

function addCartFunction(){

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
        window.location.replace('/books');
        return;
    }

    
 
}