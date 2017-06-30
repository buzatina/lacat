var express = require('express');
var router = express.Router();
var user;
var ObjectID = require('mongodb').ObjectID;

//Get Homepage
router.get('/', function(req, res){

	console.log('A request has been made for the homepage');

    res.render('index');

});

module.exports = router;