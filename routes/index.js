var express = require('express');
var router = express.Router();
var user;
var ObjectID = require('mongodb').ObjectID;

//Get Homepage
router.get('/', function(req, res){

    res.render('index');

});

//Get Homepage
router.get('/mypage/:pageid', function(req, res){

	if (req.user) {

		  // Connect To a Database
		var MongoClient = require('mongodb').MongoClient
		 , assert = require('assert');

		// Connection URL
		var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
		// Use connect method to connect to the Server
		MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);

		  console.log('The pageid params is'+ req.params.pageid);

		    // Rate Business
		  db.collection('sites').findOne({userid: ''+req.params.pageid}, function(err, site){
		          if (err) {

		            res.render('companynew', {user: req.user, errViewSite: 'errViewSite'});

		          } else {

		          	console.log(site);
		            
		            res.render('page', {site: site});

		          };

		        });

		  });

		// End Method

	};

});

module.exports = router;