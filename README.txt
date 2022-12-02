WILL UPDATE TO PROPER README LATER

Required* and Potential Functionality:

Webpages for following:
	User:
	*List of Books
	*Search
		*Search Book by any parameter it has
		Search via approximation
	*Specific Book
	*Order/Cart Page
		*Check user is in database before checkout
	*Login Page
		For now we can just input user ID
	Registration Page
		
	Owner:
	*Add/Remove Books
		Auto add new Publishers and Authors when a Book is being added(?)
	*Display Reports


Sales Calculation:
*per Author (just number of sales? or should we also do money?)
*per Genre (same as author?)
*Stock/Number Sold per book 
	out of stock alert if Stock == 0 and customer tries to buy
	*place order to publisher if Stock < threshold
*Percent Sales to Publisher (and send to bank account)
Tax/Total per order



E: 
I think the above are the simplest functionalities we can add (the ones without *) as extra. 
The only other ones I can think off are more on the complex side.
Eg: Customer reviews/ratings on books, Discount/sales

Feel free to add/modify the SQL files as you see fit if we need more things in the database.
Also, right now I have it setup such that the Customer ID is a char of fixed length.
Maybe better to have it as a varchar to have it like a username rather than an ID number?