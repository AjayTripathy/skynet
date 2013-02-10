var sys = require('sys'),
    http = require('http'),
    colors = require('colors'),
    httpProxy = require('http-proxy'),
url = require('url');

var servers = [
    {server: {host:'localhost',port:8080}, ping: 0, health: 100},
    {server: {host:'localhost',port:8081}, ping: 0, health: 100}
]

var serverList = [];
for (var i = 0; i < servers.length; i++) {
    serverList.push(servers[i].server);
}

function ping(server) {
    var start = Date.now();
    http.get(server, function(res) {
	for (var i = 0; i < servers.length; i++) {
	    if (servers[i].server == server) {
		servers[i].ping = Date.now() - start;
	    }
	}
    }).on('error', function(e) {
	//shit done goofed, put server ping as infinite or something
    });
}

function retLowestPing() {
    var lowestPing = Number.MAX_VALUE;
    var lowestServer = null;
    for (var i = 0; i < servers.length; i++) {
	if (servers[i].ping < lowestPing) {
	    lowestPing = servers[i].ping;
	    lowestServer = servers[i].server;
	}
    }
    return lowestServer;
}

var t = setInterval(function() {
    for (var i = 0; i < servers.length; i++) {
	ping(servers[i].server);
    }
}, 1000);

var proxy = httpProxy.createServer(function (req, res, proxy) {
    //var target = serverList.shift();
    var target = retLowestPing();
    //console.log(target);
    //console.log(req);
    proxy.proxyRequest(req, res, target);
    req.on('upgrade', function(req, socket, head) {
	proxy.proxyWebSocketRequest(req, socket, head, target);
    });
    //serverList.push(target);
});
proxy.listen(8001);

var initServer = http.createServer(function (req, res) {
    var query = url.parse(req.url, true).query;
    console.log(query.port);
    console.log(req.connection.remoteAddress);
    res.end();
});
initServer.listen(8002);

