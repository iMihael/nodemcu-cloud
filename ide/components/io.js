var io;

module.exports = {
    init: function(server){

        io = require('socket.io')(server);

        io.on('connection', function(){
            console.log('web socket connected');
        });
    },
    log: function(data) {
        data = data.toString();
        io.emit('log', data.substr(0, data.length - 3));
    }
};