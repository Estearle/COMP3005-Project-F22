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

--final request to finalize order with all the appropriate information
14) Retrieve all the orders 
SELECT * 
FROM public.orders

-- Insert the order if successful
15) Insert into order 
INSERT INTO orders(ordernumber,billinginfo,shippinginfo,trackinginfo,customer) 
VALUES($1,$2,$3,$4,$5)

--We also add to the information to orders database 
16) Insert the new order into bookorders database
INSERT INTO bookorders(ordernumber, isbn, numbersold) 
VALUES($1,$2,$3)

--Update the book relation with new stock, number sold and if need to restock
17) Update book 
UPDATE books 
SET stock = '${stock}', numbersold = '${sold}', restock = '${restock}' 
WHERE isbn = '${id}'

-- Update the genre sales value in genres relation
18) Update genres 
UPDATE genres 
SET sales = sales + '${books[id].add}', totalsales = totalsales + '${books[id].add * books[id].price}' 
WHERE genre = '${genres[i]}'

--Update the author sales values in authors relation
19)Update author sales
UPDATE authors 
SET sales = sales + '${books[id].add}', totalsales = totalsales + '${books[id].add * books[id].price}' 
WHERE author = '${authors[i]}'

-- Get finances page request to show all the expenditures 
20) Retrieve info from all books
SELECT *
FROM public.books

-- Show all the sales for each genre
21) Retrieve info from all genres
SELECT * 
FROM public.genres

--Show all the sales for each author
22) Retrieve info from all authors 
SELECT * 
FROM public.authors

-- Owner's side: get all the books info
23) Retrieve info from all books
SELECT * 
FROM public.books

24) Retrieve info from all book genre 
SELECT * 
FROM bookgenres

25)Retrieve info from all book authors
SELECT * 
FROM bookauthors 

-- Delete books when owner requests
24-27) Delete books and its authors and genres information 
DELETE FROM bookorders 
WHERE isbn='${isbn}'

DELETE FROM bookauthors 
WHERE isbn='${isbn}'

DELETE FROM bookgenres 
WHERE isbn='${isbn}'

DELETE FROM books 
WHERE isbn='${isbn}'

--Search Tracking number 
28) Retrieve the info from a specified tracking number
SELECT * 
FROM orders 
WHERE TrackingInfo='_speicified_tracking_num'