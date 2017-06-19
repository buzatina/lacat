var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var user;

//Get Homepage
router.get('/settings', function(req, res){

	if (req.user) {

		if (req.user) {
			user = req.user;
		};

		res.render('settings', user);

	} else {

		res.redirect('/');
		
	};
});

//Check In will be done here
router.post('/checkIn', function(req, res){
	console.log('Check In Method Invoked');
    // Get GPS Location
	 var locationArray = [];

	 locationArray.push(Number(req.body.longitude));
	 locationArray.push(Number(req.body.latitude));

    // Actual Update Method Comes Here
	UserSettings.update({_id: user._id}, { $set: { location: locationArray, latitude: Number(req.body.latitude), longitude: Number(req.body.longitude)}}, function (err, user) {
	  
    if (err){

	  } else {

	    console.log('Location is updated');
	    res.render('index', user);

	  };
	 
	});

	//checkIn method ends here

});

module.exports = router;