/*jslint browser: true, regexp: true, es5: true, nomen: true */
/*global require, process, console, __dirname */

var express = require('express');
var expressHandlebars = require('express-handlebars');

var Liveagent = function () {
    'use strict';

    var self = this;

    self.setupVariables = function () {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;

        if (self.ipaddress === undefined) {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = '127.0.0.1';
        }
    };

    self.terminator = function (sig) {
        if (typeof sig === 'string') {
            console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };

    self.setupTerminationHandlers = function () {
        process.on('exit', function () {
            self.terminator();
        });

        [
            'SIGHUP',
            'SIGINT',
            'SIGQUIT',
            'SIGILL',
            'SIGTRAP',
            'SIGABRT',
            'SIGBUS',
            'SIGFPE',
            'SIGUSR1',
            'SIGSEGV',
            'SIGUSR2',
            'SIGTERM'
        ].forEach(function (element) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };

    self.initializeServer = function () {
        self.app = express();

        self.app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
        self.app.set('view engine', 'handlebars');

        /*jslint unparam: true*/
        self.app.get('/', function (req, res) {
            res.render('index', process.env);
        });
        /*jslint unparam: false*/
    };

    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();
        self.initializeServer();
    };


    self.start = function () {
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddress, self.port);
        });
    };
};

var zapp = new Liveagent();
zapp.initialize();
zapp.start();