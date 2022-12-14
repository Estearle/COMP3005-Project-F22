let addBtn = document.getElementById("add");
addBtn.onclick = function addBook(){
    let bookName = document.getElementById("bkName").value;
    let isbn =document.getElementById('isbn').value;
    let author = document.getElementById("author").value;
    let genre = document.getElementById("genre").value;
    let publisher = document.getElementById("publisher").value;
    let pages = Number(document.getElementById("pages").value);
    let price = Number(document.getElementById("price").value);
    let stock = Number(document.getElementById("stock").value);
    let cost = Number(document.getElementById("cost").value);
    let psales = Number(document.getElementById("psales").value);
    let errorMsg ="";

    //check the input
    //if the input is incorrect, alert the owner
    if(bookName.length !== 0 && isbn.length === 13 && author.length !== 0 && genre.length !== 0 && publisher.length !== 0 && !isNaN(pages) && !isNaN(price) && !isNaN(stock) && !isNaN(psales) && !isNaN(cost) && document.getElementById("price").value.length !== 0  && document.getElementById("stock").value.length !==0 && document.getElementById("cost").value.length !==0 && document.getElementById("pages").value.length !==0 && document.getElementById("psales").value.length !==0){
        let newBook = {'isbn':isbn, 'author':author, 'genre':genre, 'bookname':bookName , 'pages':pages ,'price':price , 'stock':stock , 'publisher':publisher, 'pages':pages,'price':price,'stock':stock,'cost':cost, 'psales':psales};
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() { 
            if (this.readyState == 4 && this.status == 200) {
                alert("Success!");
            }
        }
    //Send a POST request to the server with the new book information
    xhttp.open("POST", `/books/${isbn}`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(newBook));
    }
    else{
        if(bookName.length === 0){
            errorMsg +="Please enter the book name.\n";
        }
        if(isbn.length !== 13){
            errorMsg +="Incorrect ISBN.\n";
        }
        if(author.length == 0){
            errorMsg += "Please enter the name of the author.\n";
        }
        if(genre.length == 0){
            errorMsg += "Please enter the name of the genre.\n";
        }
        if(publisher.length == 0){
            errorMsg += "Please enter the name of the publisher.\n";
        }
        if(isNaN(parseInt(pages))){
            errorMsg += "Please enter the number of page.\n";
        }
        if(isNaN(parseFloat(price))){
            errorMsg += "Please enter a number for the price.\n";
        }
        if(isNaN(parseInt(stock))){
            errorMsg +="Please enter a number for stock.\n";
        }
        if(isNaN(parseFloat(cost))){
            errorMsg += "Please enter a number for cost.\n";
        }
        alert(errorMsg);
        return;
    }
}