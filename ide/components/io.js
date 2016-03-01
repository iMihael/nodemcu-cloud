var io;

module.exports = {
    init: function(server){

        io = require('socket.io')(server);

        io.on('connection', function(){
            console.log('web socket connected');
        });
    },
    log: function(data) {
        io.emit('log', data.toString());
    }
};