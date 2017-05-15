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

//The initial menu when supervisor.js is loaded
function supervisorMenu() {
	inquirer.prompt([
			{
				type: 'list',
				message: 'Supervisor Menu:',
				choices: ['View Product Sales by Customer', 'View Product Sales by Department', 'Create New Department'],
				name: 'choice'
			}
		]).then(function(user) {
			switch (user.choice) {
				case ('View Product Sales by Customer'):
					customers();
				break;
				case ('View Product Sales by Department'):
					departments();
				break;
				case ('Create New Department'):
					newDept();
				break;
			};
		})
}

supervisorMenu();

//Shows all customers in database and respective sales history
function customers() {
	connection.query('SELECT * FROM customer_history', function(err, res) {
		console.log(line + columnify(res) + '\n' + line);
		next();
	})
}

//Shows all departments in database and respective sales history
function departments() {
	connection.query('SELECT *, total_sales - over_head_costs AS total_profit FROM departments', function(err, res) {
		console.log(line + columnify(res) + '\n' + line);
		next();
	})
}

//Allows supervisor to add new department for future products
function newDept() {
	inquirer.prompt([
			{
				type: 'input',
				message: 'Department Name:',
				name: 'department'
			},
			{
				type: 'input',
				message: 'Overhead Cost:',
				name: 'overhead'
			}
		]).then(function(user) {
			connection.query('INSERT INTO departments SET ?', [
					{
						department_name: user.department,
						over_head_costs: parseInt(user.overhead)
					}
				]);
			departments();
		});
}

//A prompt is shown at the end of each menu selection that routes back to the menu or exits
function next() {
	inquirer.prompt([
			{
				type: 'list',
				message: 'Options:',
				choices: ['Return to Menu', 'Exit'],
				name: 'selection'
			}
		]).then(function(user) {
			if (user.selection === 'Return to Menu') {
				supervisorMenu();
			} else {
				return;
			}
		})
}
