#!/bin/bash

P=`pwd`
forever stopall
rm -rf logs
mkdir logs
forever -l $P/logs/logfile-test0.log -a start ./test/testserver0.js
forever -l $P/logs/logfile-test1.log -a start ./test/testserver1.js
forever -l $P/logs/logfile-skynet.log -a start server.js
