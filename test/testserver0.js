var http = require('http');

var io = require('socket.io');

var server = http.createServer(function (req, res) {
    console.log("request received");
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<!doctype html><html><head><script src="/socket.io/socket.io.js"></script><script>var socket = io.connect("/");</script></head><body>THIS IS 1</body></html>');
    res.end();
});
server.listen(8080);

var socket = io.listen(server);
socket.on('connection', function (client) {
    console.log('connection');
    client.on('message', function (msg) {
	console.log('Got message from client: ' + msg);
    });
});
