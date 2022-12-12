Instructions to run:
Database:
Must use PostgreSQL
Run the DDL_BookStore.sql query followed by the initialRelationsInsertFile.sql to populate the database

Functionality (javascript):
Go to server.js project directory on a terminal
Just in case some dependencies are needed to be installed then run: npm install
Run the server by running: node server.js
On a browser, go to localhost:3000/

Required* and Bonus Functionality:

Webpages for following:
	User:
	*List of Books
		*Search
			*Search Book by any parameter it has
			Search via approximation (using RegEx)
		*Add to cart - Multiple Book
	*Specific Book
		*Add to cart - Single Book/Bulk
	*Order/Cart Page
		Modify Cart (Modify cart before making final submission)
		*Purchase Books
		*Update Billing/Shipping Information if necessary
	*Login Page
	Registration Page (Allow new user to register and add to database of user)
	*Tracking Information
	Logout 
		
	Owner:
	*Add Books
	*Remove Books
	*Display Reports
		*Finances
		*Authors report
		*Genres report

Sales Calculation:
*per Author
*per Genre
*Stock
	*place order to publisher if Stock < threshold
		*adds to stock 
*Finances
	*Expenses per book
	*Sales per book
	*Publisher Earnings per book
	*Profit