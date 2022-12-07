let addCart = document.getElementById("addCart");
addCart.onlick = addCartFunction;
let search = document.getElementById("search");
let searchB = document.getElementById("searchB");
searchB.onclick = searchFunction;


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
            books.push(JSON.parse(allBooks[i].name));
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
        // still working on showing it to the page but I have a filtered array of it now
        // for(let book in books){
        //     console.log(books[book].name.isbn)
        //     let label = document.getElementById(books[book].name[isbn]);
        //     console.log(label)
        //     let obj = books[book].name;
        //     if(obj !== search){
        //         books[book].style.display = "none";
        //         label.style.display = "none";
        //     }
        //     else{
        //         books[book].style.display = "visible";
        //         label.style.display ="visible";
        //     }
        // }
    } else {
        alert("Search information is empty");
        return;
    }

    
 
}