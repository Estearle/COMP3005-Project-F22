window.addEventListener('load',()=>{
    document.getElementById("search").addEventListener("click",search);
})

function search(){
    console.log("SEARCHING");
    let track = document.getElementById("searchItem").value ;
    let newPerson = { "track" : track }; 
    fetch(`http://localhost:3000/tracking/${track}`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPerson)
    })
    // fetch() returns a promise. When we have received a response from the server,
    // the promise's `then()` handler is called with the response.
    .then((response) => {
        // Our handler throws an error if the request did not succeed.
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.text();
    })
    .then((response) => {
        let obj = JSON.parse(response);
        if(obj.length == 0 ){
            alert("No item is matched");
            document.getElementById("found").innerHTML="";
            return;
        }
        else{
            alert("SUCCESS");
        }
        console.log(obj);
        obj = obj[0];
        document.getElementById("found").innerHTML="";
        const para = document.createElement("p");
        const br = document.createElement("br");
        const p2 = document.createElement("p");
        const p3 = document.createElement("p");
        const p4 = document.createElement("p");
        const p5 = document.createElement("p");
        const p6 = document.createElement("p");

        const node = document.createTextNode(`Customer:${obj.customer}` );
        const n2 = document.createTextNode(`Billing info:${obj.billinginfo}`);
        const n3 = document.createTextNode(`Order Numer:${obj.ordernumber}`);
        const n4 = document.createTextNode(`Shipping Info:${obj.shippinginfo}`);
        const n5 = document.createTextNode(`Tracking Info:${obj.trackinginfo}`);
        const n6 = document.createTextNode("Status:It is on the way.");

        const div = document.getElementById("found");
        para.appendChild(node);
        p2.appendChild(n2);
        p3.appendChild(n3);
        p4.appendChild(n4);
        p5.appendChild(n5);
        p6.appendChild(n6);
       
        
        div.appendChild(para) ;
        div.append(p2);
        div.appendChild(p3);
        div.appendChild(p4);
        div.appendChild(p5);
        div.appendChild(p6);
        // location.href=`http://${host[0]}:3000/person/${aPerson._id}`
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
    
}