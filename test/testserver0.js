var http = require('http');

http.createServer(function (req, res) {
	console.log("request received");
    res.end();
}).listen(8080);