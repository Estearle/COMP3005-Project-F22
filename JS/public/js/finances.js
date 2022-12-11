let restock = document.getElementsByClassName("restock");
for(let i = 0; i < restock.length; i++) {
    if(restock[i].stock < 20) {
        console.log(restock[i]);
        let button = restock[i].style;
        button.visibility = "visible";
        restock[i].onclick = function getStock() {
            console.log("Will send an e-mail to buy 20 stocks from: " + restock[i].publisher);
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() { 
                if (this.readyState == 4 && this.status == 200) {
                    alert(this.responseText);
                    reload();
                }
            }
            xhttp.open("PUT", `/books/${restock[i].id}`);
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.send(restock[i].id);
        }
    }
}