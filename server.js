var http = require('http'),
httpProxy = require('http-proxy');

var servers =  [{host :'localhost', port :8080}, {host : 'localhost',port :8081}];

httpProxy.createServer(function (req, res, proxy) {

    var target = servers.shift();
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log(target)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~');
    proxy.proxyRequest(req, res, target);
    servers.push(target);
    
}).listen(8000);

http.createServer(function (req, res) {
    console.log("response received");
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
}).listen(9000);