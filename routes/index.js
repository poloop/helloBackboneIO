/**
 * Created by plong on 14/01/14.
 */

/*
 * GET home page.
 */

var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');

exports.index = function(req, res){
    res.render('index', { title: 'Hello Backbone IO' });
};

