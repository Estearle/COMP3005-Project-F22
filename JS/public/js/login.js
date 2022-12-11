window.addEventListener('load', () => { 
    document.getElementById("register").onclick = save;
});

function save(){
    
	document.getElementById("error").innerHTML = "";
	let name = document.getElementById("name").value;
	let pass = document.getElementById("pass").value;
    let first = document.getElementById("first").value;
    let last= document.getElementById("last").value;
    let shipping = document.getElementById("shipping").value;
    let billing = document.getElementById("billing").value;
	let newUser = { username: name, password: pass,firstname:first,lastname:last,"shipping":shipping,"billing":billing};
	
	fetch(`http://localhost:3000/register`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    })
    // fetch() returns a promise. When we have received a response from the server,
    // the promise's `then()` handler is called with the response.
    .then((response) => {
        // Our handler throws an error if the request did not succeed.
        if (!response.ok) {
			document.getElementById("name").value = '';
			document.getElementById("pass").value = '';
			document.getElementById("error").innerHTML = "That username is taken. Please use a different username.";
        } else {
            alert("You have registered!")
			location.href=`http://localhost:3000/`;
		}
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(err));

}