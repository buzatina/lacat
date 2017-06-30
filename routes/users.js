var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

//Register Render Page
router.get('/register', function(req, res){
	res.render('register');
});

//Register POST - register a user
router.post('/register', function(req, res){
    
    var hashpass = '';

	bcrypt.genSalt(10, function(err, salt){

		bcrypt.hash(req.body.password, salt, function(err, hash){
			
			hashpass = hash;

		});

	});

    // Connect To a Database
	var MongoClient = require('mongodb').MongoClient
	 , assert = require('assert');

	// Connection URL
	var url = process.env.MONGOURI;
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected correctly to server");

      // Full text search
	  db.collection('users').insertOne({
				      username: req.body.username,
				      name: req.body.name,
				      company: req.body.company,
				      password: hashpass,
				      location: {type: 'Point', coordinates: [Number(1), Number(-1)]}
					}, function(err, result){
						if (err) {

							console.log(err);

						} else {

							console.log(result);
							res.redirect('/users/login')

						};
						
					});

	  // End insert single document

    });

});

module.exports = router;