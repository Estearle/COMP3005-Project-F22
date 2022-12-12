let remove = document.getElementById("remove");
let checkout = document.getElementById("checkout");

remove.onclick = removeFromCart;
checkout.onclick = submitOrder;
// modify cart list by using checkboxes
function removeFromCart() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() { 
        if (this.readyState == 4 && this.status == 200) {
            console.log("Success!");
            console.log();
            window.location.href = '/order';
        }
    }
    let items = document.getElementsByClassName("item");
    let del_list = {};
    for(let i = 0; i < items.length; i++) {
        if(items[i].checked) {
            item = JSON.parse(items[i].name);
            console.log(item)
            del_list[item.isbn] = item;
        }
    };
    console.log(del_list);
    xhttp.open("PUT", `/order`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(del_list));
}
// send the cart information to the next step of the order phase to finalize the order with user info
function submitOrder() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() { 
        if (this.readyState == 4 && this.status == 200) {
            console.log("Success!");
            console.log();
            window.location.href = '/final';
        }
    }
    let items = document.getElementsByClassName("item");
    let cart = {};
    for(let i = 0; i < items.length; i++) {
        item = JSON.parse(items[i].name);
        let newVal = document.getElementById(item.isbn + "_amount");
        item.add = parseInt(newVal.value);
        cart[item.isbn] = item;
    };
    console.log(cart);
    xhttp.open("POST", `/order`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(cart));
}