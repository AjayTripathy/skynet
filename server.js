var sys = require('sys'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url');

var servers = [
    {server: {host:'localhost',port:8080}, ping: 0, health: 100},
    {server: {host:'localhost',port:8081}, ping: 0, health: 100}
]


var serverStats = {}
startDate = Date.now();
serverStats['localhost:8080'] = {ping: 0, lastContact: startDate, health:100};
serverStats['localhost:8081'] = {ping: 0, lastContact: startDate, health:100};

var getKey = function(server){
    var key = server.host + ":" + server.port;
    return key;
}

var getServerFromKey = function(key){
    var server = {}
    var keyComponents = key.split(":");
    server['host'] = keyComponents[0];
    server['port'] = keyComponents[1];
    return server;
}

var serverList = [];
for (var i = 0; i < servers.length; i++) {
    serverList.push(servers[i].server);
}

function ping(server) {
    var key = getKey(server);
    var start = Date.now();
    http.get(server, function(res) {
        var date = Date.now();
        serverStats[key].lastContact = date;
		serverStats[key].ping = date - start;
	}).on('error', function(e) {
	   //shit done goofed, put server ping as infinite or something
       serverStats[key].ping = 10000000; 
    });
}

function retLowestPing() {
    var lowestPing = Number.MAX_VALUE;
    var lowestServer = null;
    serverStatsKeys = Object.keys(serverStats);
    for (var i = 0; i < serverStatsKeys.length; i++) {
        var key = serverStatsKeys[i];
        var serverStat = serverStats[key]
        if (serverStat.ping < lowestPing) {
	       lowestPing = serverStat.ping;
           console.log(key);
	       lowestServer = getServerFromKey(key);
        }
    }
    return lowestServer;
}

var t = setInterval(function() {
    serverStatsKeys = Object.keys(serverStats)
    for (var i = 0; i < serverStatsKeys.length; i++) {
	   var key = serverStatsKeys[i];
       ping(getServerFromKey(key));
    }
}, 1000);

var proxy = httpProxy.createServer(function (req, res, proxy) {
    //var target = serverList.shift();
    //var target = retLowestPing();
    var getBestServer = retLowestPing
    var target = getBestServer();
    console.log(target);
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

