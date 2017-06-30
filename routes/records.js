var express = require('express');
var router = express.Router();
var user;
var ObjectID = require('mongodb').ObjectID;

//Get New Records
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
	  db.collection('records').find({
				      userid: ''+req.user._id+'', status: 'new'
					}).toArray(function(err, records){

										if (err) {
											console.log(err)

										} else {

											res.render('records', {record: records});

										}

								    });

	  // End insert single document

    });

});


//Get Deleted Records
//Get New Records
router.get('/deleted', function(req, res){

    // Connect To a Database
	var MongoClient = require('mongodb').MongoClient
	 , assert = require('assert');

	// Connection URL
	var url = process.env.MONGOURI;
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);

      // Full text search
	  db.collection('records').find({
				      userid: ''+req.user._id+'', status: 'deleted'
					}).toArray(function(err, records){

										if (err) {
											console.log(err)

										} else {

											res.render('deleted', {record: records});

										}

								    });

	  // End insert single document

    });

});

//Get A Record
router.get('/detail/:recordid', function(req, res){

	console.log('A request to get a detailed view was made!!');
 
    var idProfile = req.params.recordid;

	Record.findById(idProfile, function (err, record) {
		if (err) {

			console.log(err);

		} else {

			res.render('record', {record: record});

		};

	});

		if (req.user) {
			user = req.user;
		};

});

//Delete A Record
router.get('/deleterecord/:recordid', function(req, res){

	     console.log('deleterecord was called');

	     var idrecord = req.params.recordid;

          // Connect To a Database
        var MongoClient = require('mongodb').MongoClient
         , assert = require('assert');

        // Connection URL
        var url = process.env.MONGOURI;
        // Use connect method to connect to the Server
        MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);

            // Full text search
          db.collection('records').update({_id: ObjectID(idrecord)}, {$set: {status: 'deleted'}}, function(err, result){
                  if (err) {

                    console.log(err);

                  } else {

                    console.log('Record was updated Max!');
                    res.redirect('/records');

                  };

                });

          // End insert single document

          }); 

});

module.exports = router;
