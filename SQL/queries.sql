-- saving the user registration to the databaase(/register and /login)
1) Retrieve a specific customer with the provided username
SELECT * 
FROM customer 
WHERE customers.uname = 'the_username_that_we_want_to_retrieve'

-- IF not found, then insert a new user into the database
2) Insert a new user into the database
INSERT into customers 
values('newUser.username','newUser.password','newUser.firstname','newUser.lastname', 'newUser.username@mail.com' , 'newUser.billing' , 'newUser.shipping')

--To load all the books from the database(/books)
3) Retrieve all the books 
SELECT * 
FROM public.books

-- To get the genres with all the books
4) Retrieve the genres of all the books with ISBN
SELECT * 
FROM bookgenres

--To get all the authors
5)Retrieve the authors of all the books 
SELECT * 
FROM bookauthors

--To load a specific book page(/book/:ISBN)
6) Retrieve a book with the corresponding ISBN
SELECT * 
FROM public.books 
WHERE isbn = 'the_specific_ISBN'

--We also want to get the genre(s) of that specifc book
7)Retrieve the genre with the corresponding ISBN
SELECT genre 
FROM public.bookgenres 
WHERE isbn = 'the_specific_ISBN'

-- To get the author(s) of that specifc book
8)Retrieve the author with the corresponding ISBN
SELECT author 
FROM bookauthors 
WHERE isbn = 'the_specific_ISBN'

--To update the specific book(/books/:ISBN)
9) Update the stock with the corresponding ISBN
UPDATE books 
SET stock = stock + 20 
WHERE isbn = 'the_specific_ISBN'

-- Add book (/add)
-- We first add a book, and then we add its author and genres into the database
10) Insert a book 
INSERT INTO books (isbn,bookname,pages,price,stock,numbersold,publisher,cost,percentsales) 
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)

11) Insert the book author 
INSERT INTO bookauthors (isbn,author)
VALUES($1,$2)

12) Insert the bookgenres
INSERT INTO bookgenres (isbn,genre)
VALUES($1,$2)

-- Finalizing order (/final)
13) Retrieve the username info 
SELECT * 
FROM public.customers
WHERE customers.uname = 'user_username'


