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

function supervisorMenu() {
	inquirer.prompt([
			{
				type: 'list',
				message: 'Supervisor Menu:',
				choices: ['View Product Sales by Department', 'Create New Department'],
				name: 'choice'
			}
		]).then(function(user) {
			switch (user.choice) {
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

function departments() {
	connection.query('SELECT *, total_sales - over_head_costs AS total_profit FROM departments', function(err, res) {
		console.log(columnify(res));
		next();
	})
}


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
