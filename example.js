var mongoose = require('mongoose')
    Schema = mongoose.Schema;

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


mongoose.connect('mongodb://localhost/mydatabase');
mongoose.model('Post',PostSchema);
var Post = mongoose.model('Post');

var post = new Post();
post.title = 'My first blog post';
post.body = '1234567890123456789012345678901234567890\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789\
12345678901234567890123456789012345678901234567890123456789';
post.date = Date.now();
post.state = 'published';
post.author.name='Arruda';
post.author.email='a@arruda.blog.br';
post.comments.push({email:'bla@bla.com',body:'bodyy'})

post.save(function(err){
    if(err){ throw err;}
    console.log('saved');
    Post.recent(10,function(err,posts){
        if (err){ throw err;}
        posts.forEach(function(post){
            console.log(post.shortBody);
            console.log(post.author.name);
            mongoose.disconnect();
        });
    });
});

