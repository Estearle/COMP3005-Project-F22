window.addEventListener('load',()=>{
    document.getElementById("search").addEventListener("click",search);
})

function search(){
    console.log("SEARCHING");
    let track = document.getElementById("searchItem").value ;
    let newPerson = { "track" : track }; 
    fetch(`http://localhost:3000/tracking`, {
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
        // Otherwise (if the response succeeded), our handler fetches the response
        // as text by calling response.text(), and immediately returns the promise
        // returned by `response.text()`.
        return response.text();
    })
    // When response.text() has succeeded, the `then()` handler is called with
    // the text, and we parse the response to retrieve the id and redirect
    // to another URL.
    .then((responsePerson) => {
        alert("SUCCESS");
        // let aPerson = JSON.parse(responsePerson)
        // location.href=`http://${host[0]}:3000/person/${aPerson._id}`
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
    
}