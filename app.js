var http = require('http');
var router = require('routes')();
var Busboy = require('busboy');
var fileSystem = require('fs');
var path = require('path');
var request = require('request');
var url = require('url');
var fs = require("fs");

var globalpath = '/var/www';
var port = 8000;

// Example from http://schempy.com/2015/03/11/streaming_file_uploads_with_nodejs/
// Define our route for uploading files
router.addRoute('/upload', function (req, res, params) {
	if (req.method === 'POST') {
	
		// Create an Busyboy instance passing the HTTP Request headers.
		var busboy = new Busboy({ headers: req.headers });
		
		// Listen for event when Busboy finds a file to stream.
		busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
			var filePath = path.join(globalpath, filename);
			console.log(filePath);
			fileStream = fs.createWriteStream(filePath);
			// We are streaming! Handle chunks
			file.on('data', function (data) {
				// Here we can act on the data chunks streamed.
				console.log('Parts received ' + fieldname);
				fileStream.write(data, "binary");
			});
			
			// Completed streaming the file.
			file.on('end', function () {
				console.log('Finished with ' + fieldname);
				fileStream.addListener("drain", function() {
		            // Close file stream
		            fileStream.end();
		            // Handle request completion, as all chunks were already written
		        });
			});
		});
		
		// Listen for event when Busboy finds a non-file field.
		busboy.on('field', function (fieldname, val) {
			// Do something with non-file field.
		});
		
		// Listen for event when Busboy is finished parsing the form.
		busboy.on('finish', function () {
			res.statusCode = 200;
			res.end();
		});
		
		// Pipe the HTTP Request into Busboy.
		req.pipe(busboy);
	}
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


router.addRoute('/download*', function (req, res, params) {
		
		var uri = url.parse(req.url).pathname;
		var file = path.basename(uri);
		var filePath = path.join(globalpath, file);
		console.log(filePath);
		var stat = null;
		try{
	    	stat = fileSystem.statSync(filePath);
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

		    var readStream = fileSystem.createReadStream(filePath);
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
});

var server = http.createServer(function (req, res) {

	// Check if the HTTP Request URL matches on of our routes.
	var match = router.match(req.url);
	
	// We have a match!
	if (match) match.fn(req, res, match.params);
});

server.listen(port, function () {
	console.log('Listening on port ' + port);
});
