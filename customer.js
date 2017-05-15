//Modules
var inquirer = require('inquirer');
var columnify = require('columnify');
var Cryptr = require('cryptr'),
    cryptr = new Cryptr('myTotalySecretKey');
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
var line = '\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n\n';
var choices = [];
var saleProduct;
var saleDepartment;
var saleLimit = 0;
var saleTotal = 0;
var saleUnitPrice = 0;
var validId = [];
var userId = 0;


login();

//Customers are prompted to log in before they can shop
function login() {
    inquirer.prompt([{
        type: 'list',
        message: 'Log In',
        choices: ['Existing User', 'New User'],
        name: 'type'
    }]).then(function(user) {
        switch (user.type) {
            case ('Existing User'):
                //Validates email and password with mysql user table
                existingUser();
                break;
            case ('New User'):
                //Adds new record to mysql user table
                newUser();
                break;
        }
    })
}

//Shows available products stored in mysql products table
function start() {
    console.log('\n=================================================================');
    console.log('========================  BAMAZON STORE  ========================');
    console.log('=================================================================');
    inventory('Add to Cart', function() {
        shop();
    });
}

//Customers are prompted to enter ID of product they wish to purchase
function shop() {
    inquirer.prompt([{
        type: 'input',
        message: 'Enter ID of item:',
        name: 'id',
        validate: function(value) {
            //ID is validated before customer can continue with purchase
            if (isNaN(value) === false && validId.indexOf(parseInt(value)) > -1) {
                return true;
            } else {
                console.log('\nInvalid ID. Please try again.');
                return false;
            }
        }
    }]).then(function(user) {
        //Product information is retrieved from database
        var id = user.id;
        connection.query('SELECT * FROM products WHERE id =' + id, function(err, res) {
            saleProduct = res[0].product;
            saleDepartment = res[0].department;
            saleLimit = res[0].stock;
            saleUnitPrice = res[0].price;
            // console.log(saleProduct);
            // console.log(saleDepartment);
            // console.log(saleLimit);
            // console.log(saleUnitPrice);
        })
        //Customer is prompted for desired quantity
        inquirer.prompt([{
            type: 'input',
            message: 'Quantity:',
            name: 'qty',
            //Product availability is validated
            validate: function(value) {
                if (isNaN(value) === false && value <= saleLimit) {
                    return true;
                } else {
                    console.log('\nInsufficient stock.');
                    return false;
                }
            }
        }]).then(function(user) {
            var qty = saleLimit - user.qty;
            var saleTotal = saleUnitPrice * user.qty;
            console.log('Thank you for your order of ' + user.qty + ' ' + saleProduct + '(s).');
            console.log('Order Total: $' + saleTotal);
            // console.log(qty);
            // console.log(id);
            // console.log(saleTotal);
            // console.log(saleDepartment);
            // console.log(userId);

            //After the sale, the database is updated with new stock and sales numbers
            sale(qty, id, saleTotal, saleDepartment);
        })
    });
}



//A query that pulls all available products from database for customers to view
function inventory(string, callback) {
    console.log('\nINVENTORY:');
    connection.query('SELECT id, product, department, price, stock FROM products', function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log(line + columnify(res, {
                minWidth: 13
            }) + '\n' + line);
            for (var i = 0; i < res.length; i++) {
                validId.push(res[i].id);
            };
            if (string != undefined) {
                console.log(string);
            };
        }
        callback();
    })
}

//Once customer completes purchase, sale information is updated in database
function sale(qty, id, total, department) {
    connection.query('UPDATE products SET product_sales = product_sales + ' + total + ', stock = ' + qty + ' WHERE id = ' + id);
    connection.query('UPDATE departments SET total_sales = total_sales + ' + total + ' WHERE department_name = "' + department + '"');
    connection.query('UPDATE customer_history SET sales = sales + ' + total + ' WHERE id = ' + userId);
    restart();
}

//Asks customers if they want to return to store after a purchase
function restart() {
    inquirer.prompt([{
        type: 'list',
        message: 'Would you like to place another order?',
        choices: ['Yes', 'Logout'],
        name: 'choice'
    }]).then(function(user) {
        if (user.choice === 'Yes') {
            start();
        } else {
            console.log('\nYou are logged out.\n');
            login();
        }
    })
}

//Validates users' email and password when they log in
function existingUser() {
    inquirer.prompt([{
        type: 'input',
        message: 'Email:',
        name: 'email'
    }, {
        type: 'password',
        message: 'Password:',
        name: 'password'
    }]).then(function(user) {
        var password = cryptr.encrypt(user.password);
        console.log(password);
        connection.query('SELECT * FROM users WHERE ? AND ?', [{
            email: user.email
        }, {
            password: password
        }], function(err, res) {
            if (err) throw err;
            if (res[0] != undefined && res[0].password === password) {
                userId = parseInt(res[0].id);
                console.log('Success');
                start();
            } else {
                console.log('Invalid email and/or password. Try again.')
                inquirer.prompt([{
                    type: 'list',
                    message: 'Troubleshoot:',
                    choices: ['Try Again', 'Forgot my Password'],
                    name: 'option'
                }]).then(function(user) {
                    switch (user.option) {
                        case ('Try Again'):
                            existingUser();
                            break;
                        case ('Forgot my Password'):
                            remember();
                            break;
                    }
                })
            }
        })
    })
}


//New users are prompted for name, email, and password
//Password is encrypted before it is saved in the database
function newUser() {
    inquirer.prompt([{
        type: 'input',
        message: 'First Name:',
        name: 'first'
    }, {
        type: 'input',
        message: 'Last Name:',
        name: 'last'
    }, {
        type: 'input',
        message: 'Email:',
        name: 'email'
    }, {
        type: 'password',
        message: 'Password:',
        name: 'password'
    }]).then(function(user) {
        var first = user.first;
        var last = user.last;
        var full = user.last + ', ' + user.first;
        var email = user.email;
        var password = cryptr.encrypt(user.password);

        connection.query('INSERT INTO users SET ?', [{
            first_name: first,
            last_name: last,
            email: email,
            password: password
        }])

        connection.query('INSERT INTO customer_history SET ?', [{
            customer: full,
            email: email
        }])

        console.log('You have successfully created an account.\n');
        existingUser();
    })
}

// A "Forgot My Password" feature
function remember() {
    inquirer.prompt([{
        type: 'input',
        message: 'Enter email:',
        name: 'email'
    }]).then(function(user) {
        connection.query('SELECT * FROM users WHERE email = "' + user.email + '"', function(err, res) {
            // console.log(res);
            if (res[0] === undefined) {
                console.log('Invalid email. Try again.')
                remember();
            } else {
                var pw = cryptr.decrypt(res[0].password);
                console.log('Your password: ' + pw + '\n');
                existingUser();
            }
        })
    })
}