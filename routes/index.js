var express = require('express');
var router = express.Router();
var user;
var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res){
	res.render('index');

});

// Start Search
router.post('/', function(req, res){

			    // Connect To a Database
				var MongoClient = require('mongodb').MongoClient
				 , assert = require('assert');

				// Connection URL
				var url = process.env.MONGOURI;
				// Use connect method to connect to the Server
				MongoClient.connect(url, function(err, db){
				  assert.equal(null, err);

		          // Full text search
				  db.collection('businesses').find({
								    "$text": {"$search": "" + req.body.query +""}, "loxion": req.body.loxion},
									{"score": { "$meta": "textScore" }}).sort({score:{"$meta":"textScore"}}).toArray(function(err, businesses){

										if (err) {

											console.log(err);

											res.end();

										} else {

										    res.render('results', {businesses: businesses});

										}

								    });

				  // End insert single document

			    });

});
// End Search

// Start Category Get
router.get('/category/:category', function(req,res){

			    // Connect To a Database
				var MongoClient = require('mongodb').MongoClient
				 , assert = require('assert');

				// Connection URL
				var url = process.env.MONGOURI;
				// Use connect method to connect to the Server
				MongoClient.connect(url, function(err, db) {
				  assert.equal(null, err);

				  console.log(req.params.category);

		          // Full text search
				  db.collection('businesses').find({"category": req.params.category}).toArray(function(err, businesses){


										if (err) {

											console.log(err);

											res.end();

										} else {


										    res.render('results', {businesses: businesses});

										}

								    });

				  // End insert single document

			    });
});
// End Category Get

// Get Biz
router.get('/biz/:bizid', function(req, res){

			    // Connect To a Database
				var MongoClient = require('mongodb').MongoClient
				 , assert = require('assert');

				// Connection URL
				var url = process.env.MONGOURI;
				// Use connect method to connect to the Server
				MongoClient.connect(url, function(err, db) {
				  assert.equal(null, err);

		          // biz
				  db.collection('businesses').find({_id: ObjectID(req.params.bizid)}).toArray(function(err, biz){

										if (err) {

											res.end();

										} else {

										          // This is going to be an aggregate
												  db.collection('businesses').find({_id: ObjectID(req.params.bizid)}).toArray(function(err, biz){

																		if (err) {

																			res.end();

																		} else {

																			console.log(biz);

																		    res.render('biz', {biz: biz});

																		}

																    });

												  // End aggregate

										}

								    });

				  // End insert single document

			    });

});
// End Get Biz

//Get Homepage
router.post('/rate', function(req, res){

	console.log('A request has been made for the homepage');

	  // Connect To a Database
	  var MongoClient = require('mongodb').MongoClient
	   , assert = require('assert');

	  // Connection URL
	  var url = process.env.MONGOURI;
	  // Use connect method to connect to the Server
	  MongoClient.connect(url, function(err, db){
	    assert.equal(null, err);

			      // Rate Business
			    db.collection('ratings').update({rateid: ''+req.body.bizid+req.user._id}, {rateid: ''+req.body.bizid+req.user._id, bizid: req.body.bizid, userid: req.user._id, rating: Number(req.body.rating)}, {upsert: true}, function(err, result){
			            if (err) {

			              console.log(err);
			              res.end();

			            } else {
			              
			              console.log('Updated Max');

			              getAverage(req.body.bizid);


			            };

			          });


	      // Get Average

	            var getAverage = function(bizid){

				    db.collection('ratings').aggregate([{ $match : {bizid : bizid} },
							     {
							       $group:
							         {
							           _id: "$bizid",
							           avgRating: { $avg: "$rating" },
							           $count: "numberRated"
							         }
							     }
							   ], function(err, resultComputed){
								            if (err) {

								              console.log(err);

								            } else {
								              
								              saveRating(bizid, resultComputed);

								            };

			          });
			    };

			          
                   var saveRating = function(bizid, result){

				      // Update Business Rating
				    db.collection('businesses').update({_id: ObjectID(bizid)},{avgRating: result.avgRating, numberRated: result.numberRated}, function(err, result){
				            if (err){

				            } else {

				            };

				          });
				    };

	    });

});

module.exports = router;