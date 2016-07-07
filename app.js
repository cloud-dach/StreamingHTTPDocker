var http = require('http');
var busboy = require('connect-busboy');
var path = require('path');
var request = require('request');
var url = require('url');
var fs = require("fs");
var mime = require('mime-types');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var express = require('express');
var app = express();
var routes = require('./routes.js');


var globalpath = '/var/www';
var port = 8000;


app.use(busboy());
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './client')));
app.use('/', routes);
app.locals.globalpath = globalpath;

var server = http.createServer(app);
server.listen(port);

// http://stackoverflow.com/questions/23691194/node-express-file-upload
app.route('/upload')
    .post(function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
      			//Path where image will be uploaded
            fstream = fs.createWriteStream(globalpath + filename);
            file.pipe(fstream);
						file.on('data', function(data) {
                console.log('Chunk');
            });
						fstream.on('close', function () {
                console.log("Upload Finished of " + filename);
                res.redirect('back');           //where to go next
            });
        });

    });

function doesExist(filePath) {
	  try {
	    fs.statSync(filePath);
	    return true
	  } catch(err) {
	    return !(err && err.code === 'ENOENT');
	  }
}

app.get('/download/*', function (req, res) {
	var uri = url.parse(req.url).pathname;
	var file = path.basename(uri);
	var filePath = path.join(globalpath, file);
	console.log(filePath);
	var stat = null;
	try{
			stat = fs.statSync(filePath);
			console.log(stat);
	}
	catch(err) {
		console.log('Error ' + err);
		res.status(500).send('Error ' + err);
	}
	if(stat!=null){
		mimetype = mime.lookup('file');
		if(!mimetype){
			mimetype = 'application/binary';
		}
		console.log('Mimetype ' + mimetype);
		res.setHeader('Content-disposition', 'attachment; filename=' + file);
		res.setHeader('Content-type', mimetype);
		var filestream = fs.createReadStream(filePath);
		filestream.pipe(res);
		filestream.on('data', function(data) {
				console.log('download chunk');
		});

		filestream.on('end', function() {
				res.end();
				console.log('download ready ' + filePath);
		});
	}
});
