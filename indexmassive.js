const express = require('express');
const http = require('http');
const massive = require('massive');

const app = express(); // intiialize express

// Set the connection information
const connectInfo = {
    host: '127.0.0.1',
    port: 5432,
    database: 'pgguide',
    user: 'postgres',
    password: 'password'
}

massive(connectInfo)
.then(instance =>{
    app.set('db',instance);
    
    // List all users email and sex in order of most recently created. Do not include password hash in the output.
    app.get('/users', (req,res) => {
        req.app.get('db').query(
			"SELECT email, details -> 'sex' as Sex FROM users ORDER BY created_at DESC").then(items => {
			console.log(res.json(items));
        });
    });
    
    // Show details of a specified user
	app.get('/users/:id', (req, res) => {

		//parse the uid from the req url
		const UID = parseInt(req.params.id);

		req.app.get('db').query(
			"SELECT email, details -> 'sex' as Sex FROM users WHERE id = $1 ORDER BY created_at DESC", UID).then( items => {
				console.log(res.json(items));
			});
    });
    
    // Receive Information about all products in ascending order of price
        app.get('/products', (req, res) => {

                if(req.query.name){

                        const prodName = req.query.name;
                        req.app.get('db').query(
                                "SELECT title, price FROM products WHERE title='"+ prodName +"'").then( items => {
                                        console.log(res.json(items));
                                });
                }else{
                        req.app.get('db').query(
                                "SELECT title, price FROM products ORDER BY price ASC").then( items => {
                                        console.log(res.json(items));
                                });
                }
        });



	// Receive Information about product, which is specified by id
	app.get('/products/:id', (req, res) => {
		
		const PID = parseInt(req.params.id);

		req.app.get('db').query(
			"SELECT title, price FROM products WHERE id =$1 ORDER BY price ASC", PID).then( items => {
				res.json(items);
			});
	});

	// Receive Information about purchases - name, address, email, price, quanty and delivery status of purchased item
	app.get('/purchases', (req, res) => {
		req.app.get('db').query(
			"SELECT p.name, p.address, u.email, i.price, i.quantity, i.state FROM purchases p INNER JOIN users u ON p.user_id = u.id INNER JOIN purchase_items i ON p.id = i.purchase_id ORDER BY i.price DESC"
		).then(items => {
			console.log(res.json(items));
		});
});
    
    
    
    http.createServer(app).listen(3000); // listen on port 3000
    console.log("Listening on port 3000");
});