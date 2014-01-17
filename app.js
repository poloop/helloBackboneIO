var express = require('express');
var mongoose = require('mongoose');
var backboneio = require('backbone.io');
var routes = require('./routes');

var http = require('http');
var url = require('url');
var querystring = require('querystring');

var fs = require('fs');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
/*app.use(express.json());
 app.use(express.urlencoded());
 app.use(express.multipart());*/
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var server = app.listen(3000);
console.log('http://localhost:3000/');

var db = mongoose.createConnection('mongodb://localhost/backboneio');
var contactSchema = new mongoose.Schema({
    nom: String,
    prenom: String
});
var Contact = db.model('Contact', contactSchema);

var contacts = backboneio.createBackend();

contacts.use('create', 'update', 'delete', function(req, res, next) {

    console.log(req.backend);
    console.log(req.method);
    console.log(JSON.stringify(req.model));
    next();

});

contacts.use(backboneio.middleware.mongooseStore(Contact));

contacts.emit('created', { nom: 'Hello', prenom: 'World' });
contacts.emit('updated', { nom: 'Al', prenom: 'Bastard' });
contacts.emit('deleted', { nom: 'Al' });

backboneio.listen(server, { contacts: contacts });

var mubsub = require('mubsub');
var client = mubsub('mongodb://localhost:27017/backboneio');
var channel = client.channel('mubsub');

channel.subscribe({ type: 'create' }, function(doc) {
    console.log(doc.type);
    Contact.create(doc.model, function(err) {
        if(err) {
            console.log(err.message);
            return;
        }
        console.log(doc.model);
        contacts.emit('created', doc.model);
    });
});

channel.subscribe({ type: 'delete' }, function(doc) {
    console.log(doc.type);
    Contact.remove( {_id: doc.model._id}, function(err) {
        if(err) {
            console.log(err.message);
            return;
        }
        console.log(doc.model);
        contacts.emit('deleted', doc.model);
    });
});

channel.subscribe({ type: 'update' }, function(doc) {
    console.log(doc.type);
    var model = {};
    for (var key in doc.model) {
        model[key] = doc.model[key];
    }
    delete model._id;
    Contact.update( { _id: doc.model._id }, { '$set': model }, function(err) {
        if(err) {
            console.log(err.message);
            return;
        }
        console.log(doc.model);
        contacts.emit('updated', doc.model);
    });
});

app.get('/', routes.index);