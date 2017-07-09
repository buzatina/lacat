const fs = require('fs');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

// This is for routing
var routes = require('./routes/index');
var users = require('./routes/users');

// Initialize the app
var app = express();

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// create http server
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(process.env.PORT || 2716);

// Set the View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

passport.use(new LocalStrategy(
  function(username, password, done) {

    // Connect To a Database
  var MongoClient = require('mongodb').MongoClient
   , assert = require('assert');

  // Connection URL
  var url = 'mongodb://tebogo:mokgaga19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
  // Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
 
    // Full text search
  db.collection('users').findOne({

              username: username

          }, function(err, user){
            if (err) {

              console.log(err);

            } else {

                bcrypt.compare(password, user.password, function(err, isMatch){
                  if(err){

                    console.log(err);

                  } else {

                    if(isMatch){

                      return done(null, user);
                      
                    };

                  };

                });

            };

          });


    // End insert single document

    });

  }));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(id, done){
 
    // Connect To a Database
  var MongoClient = require('mongodb').MongoClient
   , assert = require('assert');

  // Connection URL
  var url = 'mongodb://tebogo:mokgaga19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
  // Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
 
    // Full text search
  db.collection('users').findOne({

              username: id

          }, function(err, user){
              if (err) {

                console.log(err);

              } else {

                done(err, user);

              };

          });


    // End insert single document

    });

});

// Express Session
app.use(session({
	secret: 'secret',
  cookie: { maxAge: 600000000 },
	saveUninitialized: true,
	resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;

		while(namespace.length){
			formParam += '['+namespace.shift()+']';
		}
			return {
				param: formParam,
				msg: msg,
				value: value
			};
		}
}));

// Connect Flash
app.use(flash());

var userCheck = false;

// Global Vars
app.use(function(req, res, next){

	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
  userCheck = true;
	next();
  
});

app.post('/users/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/listbiz/list');
});

app.get('/users/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Is this the actual routing?
app.use('/', routes);
app.use('/users', users);

// What Is the best way 
var router = express.Router();

app.set('port', (process.env.PORT || 3000));

//List A business
app.get('/listbiz/list', function(req, res){
    
    var sendUser = req.user;

    sendUser.password = '';

    res.render('addlisting', {user: sendUser});


      var nsp = io.of('/'+req.user._id);
      nsp.on('connection', function(socket){

          console.log('One socket connected');

          var newListingBoolean = true;

          socket.on('newListing', function(dataBoss){

            newListingBoolean = false;

            list(dataBoss);
            
          });


        /// UPLOAD FILE METHOD START
            var list = function(data){
            
            var file = data.file;

            var AWS = require('aws-sdk');
            AWS.config = new AWS.Config();

            AWS.config.accessKeyId = 'AKIAJTAHEHCE7ITIOAMA';
            AWS.config.secretAccessKey = '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';

            //  Get userid from front side
               var url;
         
               //Upload to S3
               AWS.config.region = 'us-west-2';
               var bucketName = 'buzatina';
               var bucket = new AWS.S3({

                 params: {

                      Bucket: bucketName
                    }

                  });

                if (file) {

                    var objKey = 'Lacat/' + data.userid+ data.fileName;

                    var urlPic = 'https://s3-us-west-2.amazonaws.com/buzatina/'+objKey;

                    var params = {

                        Key: objKey,

                        ContentType: data.actualFileType,

                        Body: file
                        
                    };

                    bucket.putObject(params, function (err, dataObject) {
                        if (err){
                            
                            console.log('Error uploading pic');

                            console.log(err);

                        } else {

                              // Connect To a Database
                              var MongoClient = require('mongodb').MongoClient
                               , assert = require('assert');

                              // Connection URL
                              var url = 'mongodb://tebogo:mokgaga19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
                              // Use connect method to connect to the Server
                              MongoClient.connect(url, function(err, db){
                                assert.equal(null, err);
       
                                  // Add event to the database
                                db.collection('businesses').insertOne({userid: data.userid, companyName: data.companyName, contactEmail: data.contactEmail, phone: data.phone, loxion: data.loxion, address: data.address, fileType: data.fileType, about: data.about, category: data.category, fileUrl: urlPic, fileKey: objKey}, function(err, result){
                                        if (err) {

                                          console.log(err);

                                        } else {
                                          
                                          socket.emit('Listed', 'everyone');

                                        };

                                      });

                                });

                        }

                    });

                } else {

                    console.log('No file to upload');

                };
        };

      });
  
});
