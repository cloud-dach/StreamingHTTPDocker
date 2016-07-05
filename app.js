var http = require('http');
var busboy = require('connect-busboy');
var path = require('path');
var request = require('request');
var url = require('url');
var fs = require("fs");
var mime = require('mime-types');
var program = require('commander');
var _ = require('lodash');

var globalpath = '/var/www/';
var port = 8000;

var express = require('express');
var app = express();
var dir =  process.cwd();

app.use(busboy());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); //module directory
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

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

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

app.get('/files', function(req, res) {
 var currentDir =  globalpath;
 var query = req.query.path || '';
 if (query) currentDir = path.join(globalpath, query);
 console.log("browsing ", currentDir);
 fs.readdir(currentDir, function (err, files) {
     if (err) {
        throw err;
      }
      var data = [];
      files
      .filter(function (file) {
          return true;
      }).forEach(function (file) {
        try {
                //console.log("processing ", file);
                var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
                if (isDirectory) {
                  data.push({ Name : file, IsDirectory: true, Path : path.join(query, file)  });
                } else {
                  var ext = path.extname(file);
                  if(program.exclude && _.contains(program.exclude, ext)) {
                    console.log("excluding file ", file);
                    return;
                  }
                  data.push({ Name : file, Ext : ext, IsDirectory: false, Path : path.join(query, file) });
                }

        } catch(e) {
          console.log(e);
        }

      });
      data = _.sortBy(data, function(f) { return f.Name });
      res.json(data);
  });
});

app.get('/', function(req, res) {
 res.redirect('public/template.html');
});


/*
router.addRoute('/download*', function (req, res, params) {

		var uri = url.parse(req.url).pathname;
		var file = path.basename(uri);
		var filePath = path.join(globalpath, file);
		console.log(filePath);
		var stat = null;
		try{
	    	stat = fs.statSync(filePath);
		}
		catch(err) {
			console.log('Something bad happened');
		}

		if(stat!=null)
	    {
	    	contentType = "";
	        if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
	          contentType = "image/jpeg";
	        } else if (filePath.endsWith(".gif")) {
	          contentType = "image/gif";
	        } else if (filePath.endsWith(".png")) {
	          contentType = "image/png";
	        } else if (filePath.endsWith(".bmp")) {
	          contentType = "image/bmp";
	        } else if (filePath.endsWith(".pdf")) {
	          contentType = "application/pdf";
	        } else if (filePath.endsWith(".mp4")) {
	          contentType = "video/mp4";
	    	}
	        else {
	          contentType = "text/plain";
	        }
		    res.writeHead(200, {
		        'Content-Type': contentType,
		        'Content-Length': stat.size
		    });

		    var readStream = fs.createReadStream(filePath);
		    readStream.on('data', function(data) {
		        res.write(data);
		        console.log('download chunk');
		    });

		    readStream.on('end', function() {
		        res.end();
		        console.log('download ready ' + filePath);
		    });
	    }
	    else
	    {
	    	res.writeHead(404);
	    	res.end();
	    	console.log('File not found:' + filePath);
	    }
});*/






// // Example from http://schempy.com/2015/03/11/streaming_file_uploads_with_nodejs/
// // Define our route for uploading files
// router.addRoute('/upload', function (req, res, params) {
// 	if (req.method === 'POST') {
//
// 		// Create an Busyboy instance passing the HTTP Request headers.
// 		var busboy = new Busboy({ headers: req.headers });
//
// 		// Listen for event when Busboy finds a file to stream.
// 		busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
// 			var filePath = path.join(globalpath, filename);
// 			console.log(filePath);
// 			fileStream = fs.createWriteStream(filePath);
// 			// We are streaming! Handle chunks
// 			file.on('data', function (data) {
// 				// Here we can act on the data chunks streamed.
// 				console.log('Parts received ' + fieldname);
// 				fileStream.write(data, "binary");
// 			});
//
// 			// Completed streaming the file.
// 			file.on('end', function () {
// 				console.log('Finished with ' + fieldname);
// 				fileStream.addListener("drain", function() {
// 		            // Close file stream
// 		            fileStream.end();
// 		            // Handle request completion, as all chunks were already written
// 		        });
// 			});
// 		});
//
// 		// Listen for event when Busboy finds a non-file field.
// 		busboy.on('field', function (fieldname, val) {
// 			// Do something with non-file field.
// 		});
//
// 		// Listen for event when Busboy is finished parsing the form.
// 		busboy.on('finish', function () {
// 			res.statusCode = 200;
// 			res.end();
// 		});
//
// 		// Pipe the HTTP Request into Busboy.
// 		req.pipe(busboy);
// 	}
// });

// router.addRoute('/download*', function (req, res, params) {
//
// 		var uri = url.parse(req.url).pathname;
// 		var file = path.basename(uri);
// 		var filePath = path.join(globalpath, file);
// 		console.log(filePath);
// 		var stat = null;
// 		try{
// 	    	stat = fs.statSync(filePath);
// 		}
// 		catch(err) {
// 			console.log('Something bad happened');
// 		}
//
// 		if(stat!=null)
// 	    {
// 	    	contentType = "";
// 	        if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
// 	          contentType = "image/jpeg";
// 	        } else if (filePath.endsWith(".gif")) {
// 	          contentType = "image/gif";
// 	        } else if (filePath.endsWith(".png")) {
// 	          contentType = "image/png";
// 	        } else if (filePath.endsWith(".bmp")) {
// 	          contentType = "image/bmp";
// 	        } else if (filePath.endsWith(".pdf")) {
// 	          contentType = "application/pdf";
// 	        } else if (filePath.endsWith(".mp4")) {
// 	          contentType = "video/mp4";
// 	    	}
// 	        else {
// 	          contentType = "text/plain";
// 	        }
// 		    res.writeHead(200, {
// 		        'Content-Type': contentType,
// 		        'Content-Length': stat.size
// 		    });
//
// 		    var readStream = fs.createReadStream(filePath);
// 		    readStream.on('data', function(data) {
// 		        res.write(data);
// 		        console.log('download chunk');
// 		    });
//
// 		    readStream.on('end', function() {
// 		        res.end();
// 		        console.log('download ready ' + filePath);
// 		    });
// 	    }
// 	    else
// 	    {
// 	    	res.writeHead(404);
// 	    	res.end();
// 	    	console.log('File not found:' + filePath);
// 	    }
// });
