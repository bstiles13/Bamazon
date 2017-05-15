CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
		id INT(11) AUTO_INCREMENT NOT NULL,
        product VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        stock INT(11) NOT NULL DEFAULT 0,
        PRIMARY KEY (id)
);

ALTER TABLE products
ADD COLUMN product_sales DECIMAL(12,2) DEFAULT 0 AFTER stock;

UPDATE products SET product_sales = 10, stock = 9 WHERE id = 2;


SELECT * FROM products;

CREATE TABLE departments(
		department_id INT AUTO_INCREMENT NOT NULL,
		department_name VARCHAR(100) NOT NULL,
		over_head_costs DECIMAL(10,2) NOT NULL DEFAULT 0,
		total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
        PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name) VALUES ("Clothing/Apparel");
INSERT INTO departments (department_name) VALUES ("Electronics");
INSERT INTO departments (department_name) VALUES ("Food");
INSERT INTO departments (department_name) VALUES ("Home/Garden");
INSERT INTO departments (department_name) VALUES ("Sports/Outdoors");

SELECT * FROM departments;

SELECT *, total_sales - over_head_costs AS total_profit FROM departments;

CREATE TABLE users(
		id INT AUTO_INCREMENT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(50) NOT NULL,
        PRIMARY KEY (id)
);

SELECT * FROM users;

CREATE TABLE customer_history(
		id INT AUTO_INCREMENT NOT NULL,
        customer VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        sales DECIMAL(12,2) DEFAULT 0,
        PRIMARY KEY (id)
);

SELECT * FROM customer_history;