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
server.listen(process.env.PORT || 3000);

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
  var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
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

passport.deserializeUser(function(id, done) {
 
    // Connect To a Database
  var MongoClient = require('mongodb').MongoClient
   , assert = require('assert');

  // Connection URL
  var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
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
  function(req, res){
    res.redirect('/company/profile');
});

app.get('/users/login', function(req, res){

  if (req.user) {

    res.redirect('/company/profile');

  };

  res.render('login');

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

app.set('port', (process.env.PORT || 2709));

//profile Pic Event
app.get('/company/profile', function(req, res){

    if (req.user) {} else{res.redirect('/users/login')};


    console.log('It is detecting something');
    
    var sendUser = req.user;

    sendUser.password = '';

    var nsp = io.of('/'+req.user._id);

      // Connect To a Database
    var MongoClient = require('mongodb').MongoClient
     , assert = require('assert');

    // Connection URL
    var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

        // Rate Business
      db.collection('sites').findOne({userid: ''+req.user._id}, function(err, site){
        
              if (err) {
 
                res.render('companynew', {user: sendUser});

              } else {

                console.log(site);
                console.log(req.user._id);
                
                res.render('companynew', {user: sendUser, site: site});

              };

            });

      });
      
      nsp.on('connection', function(socket){

          console.log('One socket connected');

          var receiveDataPic = true;
          var receiveDataVideo = true;
          var receiveDataAbout = true;
          var receiveDataContact = true;
          var receiveDataSocial = true;

          socket.on('socialProfile', function(dataBoss){

              if (receiveDataSocial) {

                receiveDataSocial = false;

                setProfileSocial(dataBoss);
                
              };           

          });

          socket.on('contactProfile', function(dataBoss){

              if (receiveDataContact) {

                receiveDataContact = false;

                setProfileContact(dataBoss);
                
              };           

          });

          socket.on('aboutProfile', function(dataBoss){

              if (receiveDataAbout) {

                receiveDataAbout = false;

                setProfileAbout(dataBoss);
                
              };           

          });

          socket.on('newProfilePic', function(dataBoss){

              if (receiveDataPic) {

                receiveDataPic = false;

                setProfilePic(dataBoss);
                
              };           

          });

          socket.on('newProfileVideo', function(dataBoss){

              if (receiveDataVideo) {

                receiveDataVideo = false;

                setProfileVideo(dataBoss);
                
              };           

          });

        /// Set Social Info
            var setProfileSocial = function(data){
            
                  // Connect To a Database
                var MongoClient = require('mongodb').MongoClient
                 , assert = require('assert');

                // Connection URL
                var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
                // Use connect method to connect to the Server
                MongoClient.connect(url, function(err, db) {
                  assert.equal(null, err);

                    // Rate Business
                  db.collection('sites').update({userid: data.userid}, {facebook: data.facebook, twitter: data.twitter, linkedin: data.linkedin, instagram: data.instagram}, {upsert: true}, function(err, result){
                          
                          if (err) {

                            console.log(err);

                            receiveDataSocial = true;

                            socket.emit('errUploading', 'everyone');

                          } else {
                            
                            console.log('Updated Max');

                            socket.emit('uploadedSocialEvent', 'everyone');

                            receiveDataSocial = true;

                          };


                        });                  
                  });
        }; 

        /// Set Contact Info
            var setProfileContact = function(data){
            
                  // Connect To a Database
                var MongoClient = require('mongodb').MongoClient
                 , assert = require('assert');

                // Connection URL
                var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
                // Use connect method to connect to the Server
                MongoClient.connect(url, function(err, db) {
                  assert.equal(null, err);

                    // Rate Business
                  db.collection('sites').update({userid: data.userid}, {$set:{userid: data.userid, address: data.address, phone: data.phone, contactEmail: data.contactEmail}}, {upsert: true}, function(err, result){
                          if (err) {

                            console.log(err);

                            receiveDataContact = true;

                            socket.emit('errUploadingContact', 'everyone');

                          } else {
                            
                            console.log('Updated Max');

                            socket.emit('uploadedContactEvent', 'everyone');

                            receiveDataContact = true;

                          };

                        });

                  });

        };          

        /// Set About and Page Title
            var setProfileAbout = function(data){
            
                  // Connect To a Database
                var MongoClient = require('mongodb').MongoClient
                 , assert = require('assert');

                // Connection URL
                var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
                // Use connect method to connect to the Server
                MongoClient.connect(url, function(err, db) {
                  assert.equal(null, err);

                    // Rate Business
                  db.collection('sites').update({userid: data.userid}, {$set:{userid: data.userid, about: data.about, title: data.title}}, {upsert: true}, function(err, result){
                          if (err) {

                            console.log(err);

                            receiveDataAbout = true;

                            socket.emit('errAboutUploading', 'everyone');

                          } else {
                            
                            console.log('Updated Max');

                            socket.emit('uploadedAboutEvent', 'everyone');

                            receiveDataAbout = true;

                          };

                        });

                  });

        };          

        /// UPLOAD FILE METHOD START
            var setProfileVideo = function(data){

            console.log('Uploading Video');
            console.log(data);
            
            var file = data.file;

            var AWS = require('aws-sdk');
            AWS.config = new AWS.Config();

            AWS.config.accessKeyId = 'AKIAJXQLIK4D4DIUET6Q';
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

                    //Object key will be facebook-USERID#/FILE_NAME

                    // var objKey = 'Lacat/' + data.userId;

                    var objKey = 'buzatinalive/' + data.userid+ data.fileName;

                    var urlPic = 'https://s3-us-west-2.amazonaws.com/buzatina/'+objKey;

                    var params = {

                        Key: objKey,

                        ContentType: data.actualFileType,

                        Body: file
                        
                    };

                    bucket.putObject(params, function (err, dataObject) {
                        if (err) {
                            
                            socket.emit('errVideoUploading', 'everyone');

                            receiveDataVideo = true;

                            console.log(err);

                        } else {


                                // Connect To a Database
                              var MongoClient = require('mongodb').MongoClient
                               , assert = require('assert');

                              // Connection URL
                              var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
                              // Use connect method to connect to the Server
                              MongoClient.connect(url, function(err, db) {
                                assert.equal(null, err);

                                  // Rate Business
                                db.collection('sites').update({userid: data.userid}, {$set: {userid: data.userid, userid: data.userid, videoProfile: true, videofileType: data.actualFileType, videofileUrl: urlPic, videofileKey: objKey}}, {upsert: true}, function(err, result){
                                        if (err) {

                                          console.log(err);

                                          receiveDataVideo = true;

                                          socket.emit('errVideoUploading', 'everyone');

                                        } else {
                                          
                                          console.log('Updated Max');

                                          socket.emit('uploadedVideoEvent', 'everyone');

                                          receiveDataVideo = true;


                                        };

                                      });

                                // End insert single document

                                });


                            console.log('File Uploaded');

                        }

                    });

                } else {

                    socket.emit('errVideoUploading', 'everyone');

                    receiveDataVideo = true;

                };
        };

        /// UPLOAD FILE METHOD START
            var setProfilePic = function(data){
            
            var file = data.file;

            var AWS = require('aws-sdk');
            AWS.config = new AWS.Config();

            AWS.config.accessKeyId = 'AKIAJXQLIK4D4DIUET6Q';
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

                    //Object key will be facebook-USERID#/FILE_NAME

                    // var objKey = 'Lacat/' + data.userId;

                    var objKey = 'buzatinalive/' + data.userid+ data.fileName;

                    var urlPic = 'https://s3-us-west-2.amazonaws.com/buzatina/'+objKey;

                    var params = {

                        Key: objKey,

                        ContentType: data.actualFileType,

                        Body: file
                        
                    };

                    bucket.putObject(params, function (err, dataObject) {
                        if (err) {
                            
                            socket.emit('errPictureUploading', 'everyone');

                            console.log(err);

                        } else {


                                // Connect To a Database
                              var MongoClient = require('mongodb').MongoClient
                               , assert = require('assert');

                              // Connection URL
                              var url = 'mongodb://max:max19916@ds155920-a0.mlab.com:55920,ds155920-a1.mlab.com:55920/buzatinalive?replicaSet=rs-ds155920';
                              // Use connect method to connect to the Server
                              MongoClient.connect(url, function(err, db) {
                                assert.equal(null, err);

                                  // Rate Business
                                db.collection('sites').update({userid: data.userid}, {$set: {userid: data.userid, picProfile: true, picfileType: data.fileType, picfileUrl: urlPic, picfileKey: objKey}}, {upsert: true}, function(err, result){
                                        if (err) {

                                          console.log(err);
                                          receiveDataPic = true;
                                          socket.emit('errPictureUploading', 'everyone');

                                        } else {
                                          
                                          console.log('Updated Max');

                                          receiveDataPic = true;

                                          socket.emit('uploadedPictureEvent', 'everyone');


                                        };

                                      });

                                // End insert single document

                                });

                          console.log('File Uploaded');

                        }

                    });

                } else {

                    socket.emit('errPictureUploading', 'everyone');
                    receiveDataPic = true;

                };
        };

      });
  
});