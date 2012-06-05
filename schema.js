
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

var CommentSchema = new Schema({
    email: String,
    body: String,
});
var PostSchema = new Schema({
    title: String,
    body: String,
    date: {type: Date, default: Date.now},
    state: {type: String,enum:['draft','published','private'], default:'draft'},
    author: {
        name: String,
        email:{type: String, validate:validateEmail }
    },
    comments: [CommentSchema]
});
PostSchema.static('recent',function(days,callback){
    days = days || 1;
    this.find({date: {$gte: Date.now()-1000 * 60 * 60 * 24 * days} }, callback);
});
PostSchema.virtual('shortBody').get(function(){
    return this.body.substring(0,50);
});


exports.PostSchema = PostSchema;
