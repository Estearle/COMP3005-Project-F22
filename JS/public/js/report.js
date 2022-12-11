let select = document.getElementById("report");
console.log(select);
// select.onchange(openPage);

function openPage() {
    console.log(select.value);
    if (select.value === 'finance') {
        console.log(select.value);
        window.location.href = '/finance';
    } else if (select.value === 'genre') {
        window.location.href = '/genres';
    } else if (select.value === 'author') {
        window.location.href = '/authors';
    }
}