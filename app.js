
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , path = require('path')
  , config = {};

/**
 * Loading configuration
 */
switch(process.env.NODE_ENV) {
    case 'development':
        config = exports.config = require('./config-dev.json');
    break;
    case 'production':
        config = exports.config = require('./config-prod.json');
    break;
    default:
        if(typeof process.env.NODE_ENV == 'undefined') {
            config = exports.config = require('./config-dev.json');
            process.env.NODE_ENV = 'development';
        }
    break;
}



var app = express();

// all environments
app.set('port', process.env.PORT || config.app.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
* Auth
*/
//require('./auth.js');
passport.use(new FacebookStrategy({
    clientID: config.auth.facebook.clientid,
    clientSecret: config.auth.facebook.clientsecret,
    callbackURL: config.auth.facebook.callback
  },
  function(accessToken, refreshToken, profile, done) {
  }
));

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

app.get('/', routes.index);
app.get('/users', user.list);

var server = exports.server = http.createServer(app).listen(app.get('port'), config.app.domain, function(){
  console.log("Express server listening on port " + app.get('port'));
});

/**
* Socket.io
*/

require('./sockets.js');
