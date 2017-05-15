//Modules
var inquirer = require('inquirer');
var columnify = require('columnify');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'Bamazon'
})

connection.connect(function(err) {
    // console.log('Connected')
});

//Global variables
var line = '\n::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n\n';
var menu = ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'];
var departments = ['Clothing/Apparel', 'Electronics', 'Food', 'Home/Garden', 'Sports/Outdoors'];

//The initial menu when manager.js is loaded
function managerMenu() {
    inquirer.prompt([{
        type: 'list',
        message: 'Admin Menu:',
        choices: menu,
        name: 'choice'
    }]).then(function(user) {

        switch (user.choice) {
            case ('View Products for Sale'):
                products();
                break;
            case ('View Low Inventory'):
                low();
                break;
            case ('Add to Inventory'):
                products(replenish);
                break;
            case ('Add New Product'):
                products(addProduct);
                break;
        }
    })
}

managerMenu();


//Shows all product information including department, stock, and sales
function products(callback) {
    console.log('\nINVENTORY:');
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log(line + columnify(res, {
                minWidth: 13
            }) + '\n' + line);
        }
        if (typeof callback === 'function') {
            callback();
        } else {
            next();
        }
    })
}


//Shows all product information where stock is less than 5
function low() {
    console.log('\nLOW INVENTORY:');
    connection.query('SELECT * FROM products WHERE stock < 5', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log(line + columnify(res, {
                minWidth: 13
            }) + line);
            next();
        }
    })
}

//Manager can add stock to any product by ID
function replenish() {
    inquirer.prompt([{
        type: 'input',
        message: '\nProduct ID:',
        name: 'id'
    }, {
        type: 'input',
        message: 'Number of items:',
        name: 'increase'
    }]).then(function(user) {
        var id = user.id;
        var increase = parseInt(user.increase);

        connection.query('SELECT * FROM products WHERE id =' + id, function(err, res) {
            var stock = res[0].stock + parseInt(increase);
            connection.query('UPDATE products SET ? WHERE ?', [{
                stock: stock
            }, {
                id: id
            }]);
            console.log(line + 'STOCK UPDATE: ' + res[0].product + '\n\nPrevious Stock: ' + res[0].stock + '\nAdded: ' + increase + '\nCurrent Stock: ' + stock + '\n' + line);
            next();
        })
    })
}

//Adds new product to database
//Stock set to 0 by default 
function addProduct() {
    inquirer.prompt([{
        type: 'input',
        message: 'Product Name:',
        name: 'product'
    }, {
        type: 'list',
        message: 'Category:',
        choices: departments,
        name: 'department'
    }, {
        type: 'input',
        message: 'Price ($)',
        name: 'price'
    }]).then(function(user) {
        var newProduct = user.product;
        var newDepartment = user.department;
        var newPrice = parseInt(user.price);
        connection.query('INSERT INTO products SET ?', {
            product: newProduct,
            department: newDepartment,
            price: newPrice,
            stock: 0
        })
        products(managerMenu);
    })
}

//A prompt is shown at the end of each menu selection that routes back to the menu or exits
function next() {
    inquirer.prompt([{
        type: 'list',
        message: 'Options:',
        choices: ['Return to Menu', 'Exit'],
        name: 'selection'
    }]).then(function(user) {
        if (user.selection === 'Return to Menu') {
            managerMenu();
        } else {
            return;
        }
    })
}