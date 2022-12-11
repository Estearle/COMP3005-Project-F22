let order = document.getElementById("order");
order.onclick = sendOrder;

function sendOrder() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() { 
        if (this.readyState == 4 && this.status == 200) {
            console.log("Success!");
            alert("Tracking Number: " + this.responseText);
            window.location.href = '/welcome';
        }
    }
    let books = document.getElementsByClassName("book");
    let user = JSON.parse(document.getElementById("user").getAttribute("name"));
    let cart = {};
    for(let i = 0; i < books.length; i++) {
        let book = JSON.parse(books[i].getAttribute("name"));
        console.log(book);
        cart[book.isbn] = book;
    };
    let info = {cart, user};
    console.log(info);
    xhttp.open("POST", `/final`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(info));
}