const mysql = require('mysql2');
const inquirer = require('inquirer');
const Table = require('cli-table');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root", //Your Username
    password: '', //Your Password
    database: "bamazon"
});
const displayAll = () => {
    connection.query('SELECT * FROM products', function(error, response) {
        if (error) { console.log(error) };
        let productTable = new Table({
            head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Quantity'],
            colWidths: [10, 30, 18, 10, 14]
        });
        for (var i = 0; i < response.length; i++) {
            productTable.push(
                [response[i].item_id, response[i].product_name , response[i].department_name, response[i].price , response[i].stock_quantity]
            );
        }
        console.log(productTable.toString());
        promptPurchase();
    });
};
const promptPurchase = () => {
    inquirer.prompt([
        {
            name: "ID",
            type: "input",
            message: "What is the ID of the proudct you would like to purchase?"
        }, {
            name: 'Quantity',
            type: 'input',
            message: "Please enter they quantity you would like to purchase?"
        },
    ]).then(function(order) {
        let quantity = order.Quantity;
        let productId = order.ID;
        purchaseFromDatabase(productId, quantity);
    });
};
const purchaseFromDatabase = (productId, quantity) => {
    connection.query('SELECT * FROM products WHERE item_id = ' + productId, function(error, response) {
        if (error) { console.log(error) };
        if (quantity <= response[0].stock_quantity) {
            let totalCost = response[0].price  * quantity;
            console.log(`
                \n
                ------------------------------------------------------------------
                \n
                We have ${response[0].product_name} in stock!
                \n
                ------------------------------------------------------------------
                \n
                Your total cost for ${quantity} ${response[0].product_name}(s) is \$${totalCost}. Thank you for your purchase!
                \n
                ------------------------------------------------------------------
            `);
            connection.query('UPDATE Products SET stock_quantity = stock_quantity - ' + quantity + ' WHERE item_id = ' + productId);
        } else {
            console.log(`
                \n
                ------------------------------------------------------------------
                \n
                Our apologies. We don't have ${response[0].product_name} in stock for the quantity you desire.
                \n
                ------------------------------------------------------------------
                \n
            `);
        };
        displayAll();
    });
};
displayAll();