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

var line = '\n::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::\n\n';
var choices = [];
var saleProduct;
var saleDepartment;
var saleLimit = 0;
var saleTotal = 0;
var saleUnitPrice = 0;
var validId = [];


function start() {
    console.log('\n=================================================================');
    console.log('========================  BAMAZON STORE  ========================');
    console.log('=================================================================');
    inventory('Add to Cart', function() {
        shop();
    });
}

start();

function shop() {
    inquirer.prompt([{
        type: 'input',
        message: 'Enter ID of item:',
        name: 'id',
        validate: function(value) {
            if (isNaN(value) === false && validId.indexOf(parseInt(value)) > - 1) {
                return true;
            } else {
                console.log('\nInvalid ID. Please try again.');
                return false;
            }
        }
    }]).then(function(user) {
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
        inquirer.prompt([{
            type: 'input',
            message: 'Quantity:',
            name: 'qty',
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
            console.log(qty);
            console.log(id);
            console.log(saleTotal);
            console.log(saleDepartment);
            sale(qty, id, saleTotal, saleDepartment);
        })
    });
}




function inventory(string, callback) {
    console.log('\nINVENTORY:');
    connection.query('SELECT * FROM products', function(err, res) {
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

function sale(qty, id, total, department) {
    connection.query('UPDATE products SET product_sales = product_sales + ' + total + ', stock = ' + qty + ' WHERE id = ' + id);
    connection.query('UPDATE departments SET total_sales = total_sales + ' + total + ' WHERE department_name = "' + department + '"');
    restart();
}

function restart() {
    inquirer.prompt([{
        type: 'list',
        message: 'Would you like to place another order?',
        choices: ['Yes', 'I am done'],
        name: 'choice'
    }]).then(function(user) {
        if (user.choice === 'Yes') {
            start();
        } else {
            return;
        }
    })
}