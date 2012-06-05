var querystring = require("querystring");
var schemas = require("./schema");
    fs = require("fs");
    formidable = require("formidable");

var mongoose = require('mongoose')
var PostSchema = schemas.PostSchema;

function start(response,request) {
  console.log("Request handler 'start' was called.");
    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; '+
        'charset=UTF-8" />'+
        '</head>'+
        '<body>'+
        '<form action="/upload" enctype="multipart/form-data" '+
        'method="post">'+
        '<input type="file" name="upload">'+
        '<input type="submit" value="Upload file" />'+
        '</form>'+
        '</body>'+
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response,request) {
  console.log("Request handler 'upload' was called.");

  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) {
    console.log("parsing done");

    /* Possible error on Windows systems:
       tried to rename to an already existing file */
    fs.rename(files.upload.path, "/tmp/test.png", function(err) {
      if (err) {
        fs.unlink("/tmp/test.png");
        fs.rename(files.upload.path, "/tmp/test.png");
      }
    });
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();
  });
}


function show(response, request) {
  console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

function mongo(response, request) {
  console.log("Request handler 'mongo' was called.");

    mongoose.connect('mongodb://localhost/mydatabase');
    mongoose.model('Post',PostSchema);
    var Post = mongoose.model('Post');
//    var post = new Post();
//    post.title = 'My first blog post';
//    post.body = '12345678901234567890123456789012345678901234567890123456789\
//    12345678901234567890123456789012345678901234567890123456789\
//    12345678901234567890123456789012345678901234567890123456789';
//    post.date = Date.now();
//    post.state = 'published';
//    post.author.name='Arruda';
//    post.author.email='a@arruda.blog.br';
//    post.comments.push({email:'bla@bla.com',body:'bodyy'})

    mongo_prepare(Post);

        Post.recent(10,function(err,posts){
            if (err){ throw err;}
            out="";
            posts.forEach(function(post){
                out += post.shortBody+"\n";
                out += post.author.name+"\n";
                console.log(post.shortBody);
                console.log(post.author.name);
            });
            mongoose.disconnect();
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(out+"\n");
            response.end();
        });
}

function mongo_prepare(PostModel) {
    console.log("preparing huge data.");
    for(i=0;i<10000;i++){
        console.log(i);
        var post = new PostModel();
        post.title = 'My first blog post';
        post.body = ''+i;
        post.date = Date.now();
        post.state = 'published';
        post.author.name='Arruda'+i;
        post.author.email='a@arruda.blog.br';
        post.comments.push({email:'bla@bla.com',body:'bodyy'})

        post.save(function(err){
            if(err){ throw err;}
            console.log('saved');
        });    
    }
}


exports.start = start;
exports.upload = upload;
exports.show = show;
exports.mongo = mongo;
