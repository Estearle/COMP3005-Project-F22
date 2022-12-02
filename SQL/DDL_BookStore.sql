create table customers
	(ID				CHAR(9) NOT NULL UNIQUE PRIMARY KEY,
	 Fname			VARCHAR(15) NOT NULL,
	 Lname			VARCHAR(15) NOT NULL,
	 Email			VARCHAR(30) NOT NULL UNIQUE,
	 BillingInfo	VARCHAR(30),
	 ShippingInfo	VARCHAR(30)
	);

create table publishers
	(Name			VARCHAR(20) NOT NULL UNIQUE PRIMARY KEY,
	 Address		VARCHAR(30),
	 Email			VARCHAR(30) NOT NULL UNIQUE,
	 BankAccount	CHAR(10) NOT NULL UNIQUE
	);
	
create table phone
	(Name			VARCHAR(20) NOT NULL REFERENCES publisher,
	 Phone			CHAR(10) NOT NULL UNIQUE,
	 primary key (Name, Phone),
	);
	
create table books
	(ISBN			CHAR(13) NOT NULL UNIQUE PRIMARY KEY,
	 BookName		VARCHAR(30) NOT NULL,
	 Pages			INTEGER NOT NULL,
	 Price			NUMERIC(5,2) NOT NULL,
	 Stock			INTEGER NOT NULL,
	 NumberSold		INTEGER,
	 Publisher		VARCHAR(20) NOT NULL UNIQUE REFERENCES publisher(Name),
	 PercentSales	NUMERIC(3,0)
	);
	
create table orders
	(OrderNumber	CHAR(10) NOT NULL UNIQUE PRIMARY KEY,
	 BillingInfo	VARCHAR(30),
	 ShippingInfo	VARCHAR(30),
	 TrackingInfo	CHAR(10),
	 Customer		CHAR(9) NOT NULL REFERENCES customer(ID)
	);

create table bookorders
	(OrderNumber	CHAR(12) NOT NULL UNIQUE,
	 ISBN			CHAR(13) NOT NULL,
	 NumberSold		INTEGER NOT NULL,
	 primary key (OrderNumber, ISBN),
	 foreign key (OrderNumber) REFERENCES orders,
	 foreign key (ISBN) REFERENCES books
	);

create table authors
	(Author			VARCHAR(30) NOT NULL UNIQUE PRIMARY KEY,
	 Sales			INTEGER
	);
	
create table genres
	(Genre			VARCHAR(15) NOT NULL UNIQUE PRIMARY KEY,
	 Sales			INTEGER
	);
	
create table bookauthors
	(ISBN			CHAR(13) NOT NULL,
	 Author			VARCHAR(30) NOT NULL,
	 primary key (ISBN, Author),
	 foreign key (ISBN) REFERENCES books,
	 foreign key (Author) REFERENCES authors
	);
	
create table bookgenres
	(ISBN			CHAR(13) NOT NULL,
	 Genre			VARCHAR(15) NOT NULL,
	 primary key (ISBN, Genre),
	 foreign key (ISBN) REFERENCES books,
	 foreign key (Genre) REFERENCES genres
	);