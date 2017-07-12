var express = require('express');
var router = express.Router();
var user;
var ObjectID = require('mongodb').ObjectID;

//Get Homepage
router.post('/saveevents', function(req, res){

	console.log(req.body);

	// Connect To a Database
	var MongoClient = require('mongodb').MongoClient
	, assert = require('assert');

	  // Connection URL
	  var url = process.env.MONGOURI;
	  // Use connect method to connect to the Server
	  MongoClient.connect(url, function(err, db){
	    assert.equal(null, err);

			      // Rate Business
			    db.collection('events').update({_id: ObjectID(req.body.eventid)}, {$push:{comments:{name: req.body.name, suggestion: req.body.suggestion, bitterText: req.body.bitterText, sweetText: req.body.sweetText}}}, {upsert: true}, function(err, result){
			            
				            if (err) {

				              res.end();

				            } else {

				            	res.redirect('back');
				              
				            };

			          });

	      // Get Average

	    });

});

//Get Events
router.get('/', function(req, res){

    // Connect To a Database
	var MongoClient = require('mongodb').MongoClient
	 , assert = require('assert');

	// Connection URL
	var url = process.env.MONGOURI;
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);

      // Full text search
	  db.collection('events').find({
				      company: ''+req.user.company+''
					}).sort({"eventDate": -1}).toArray(function(err, docsEvents){

										if (err) {
											console.log(err)

										} else {

											console.log(docsEvents);

											res.render('events', {events: docsEvents});
										}

								    });

	  // End insert single document

    });

});

//Search for events
router.post('/', function(req,res){

			    // Connect To a Database
				var MongoClient = require('mongodb').MongoClient
				 , assert = require('assert');

				// Connection URL
				var url = process.env.MONGOURI;
				// Use connect method to connect to the Server
				MongoClient.connect(url, function(err, db) {
				  assert.equal(null, err);

				  console.log(req.body.query);

		          // Full text search
				  db.collection('events').find({
								    "$text": { "$search": req.body.query}},
									{"score": { "$meta": "textScore" }}).sort({score:{"$meta":"textScore"}}).toArray(function(err, docs){

										if (err) {

											console.log(err);

											res.end();

										} else {

											console.log(docs);
											res.render('events', {events: docs});

										}

								    });

			    });

});

//Get Events
router.get('/detailed/:eventid', function(req, res){

	console.log('The request parameter is solid');

	console.log(req.params.eventid);

    // Connect To a Database
	var MongoClient = require('mongodb').MongoClient
	 , assert = require('assert');

	// Connection URL
	var url = process.env.MONGOURI;
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);

      // Full text search
	  db.collection('events').find({
				      _id: ObjectID(req.params.eventid)
					}).sort({"eventDate": -1}).toArray(function(err, event){

										if (err) {
											console.log(err)

										} else {

											console.log(event);

											res.render('experience', {event: event});

										}

								    });


    });

});

module.exports = router;