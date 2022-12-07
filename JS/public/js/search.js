let addCart = document.getElementById("addCart");
addCart.onlick = addCartFunction;
let search = document.getElementById("search");
search.onclick = searchFunction;


function addCartFunction(){

}

function searchFunction(){
    console.log("SEARCHING!")
    let bookName = document.getElementById("bName").value;
    let isbn =document.getElementById('isbnBook').value;
    let author = document.getElementById("aName").value;
    let genre = document.getElementById("genreBook").value;
    let checkbox = document.getElementById("bookList").querySelectorAll(".search");
    let search ;

    
    //check the input
    //if the input is incorrect, alert the owner
    if(bookName.length !== 0){
        search = bookName;
        
    } 
    else if(isbn.length === 13){
        search = isbn;
    }
    else if (author.length !== 0 ){
        search = author;
    }
    else if(genre.length !== 0){
        search = genre;
    }
    else{
        alert("Please enter at least one of them.")
        return;
    }

    for( books in checkbox){
        console.log(checkbox[books].name.isbn)
        let label = document.getElementById(checkbox[books].name[isbn]);
        console.log(label)
        let obj = checkbox[books].name;
        if(obj !== search){
            checkbox[books].style.display = "hidden";
            label.style.display = "hidden";
        }
        else{
            checkbox[books].style.display = "visible";
            label.style.display ="visible";
        }
        
    }
    

    
}