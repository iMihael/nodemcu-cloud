var net = require('net');
var socket;
var ip;
var port;
var io = require('./io');

var dataF = function(){};
var errorF = function(){};

var client = {
    data: function(data){
        dataF(data);
    },
    error: function(){
        errorF();
    },
    tryConnection: function(_ip, _port, success, error) {

        ip = _ip;
        port = _port;


        socket  = net.connect({
            port: _port,
            host: _ip
        }, function(){

            this.on('error', client.error);
            this.on('data', client.data);
            dataF = function(){
                success();
            };

            errorF = function(){
                error();
            };

            this.write("printc(\"HELLO\");");
        });
    },
    cmdNoResponse: function(cmd) {
        dataF = function(data){
            io.log(data.toString());
        };
        errorF = function(){};

        socket.write(cmd);
    },
    cmd: function(cmd, success, error){
        errorF = function(){
            error();
        };

        dataF = function(data){
            if(data.toString() == "ERROR\n") {
                console.log(cmd);
                io.log(data.toString() + " " + cmd);
                error();
                return;
            } else {
                io.log(data.toString());
            }
            success(data.toString());
        };

        socket.write(cmd);
    }
};

module.exports = client;