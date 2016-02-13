/**
 * Created by mihael on 12.02.16.
 */
var express = require('express');
var router = express.Router();
var net = require('./net');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'NodeMCU IDE'
    });
});

router.post('/v1/connect', function(req, res){

    net.tryConnection(req.body.ip, req.body.port, function(){
        res.status(204);
        res.end();
    }, function(){
        res.status(500);
        res.end();
    });


});

router.post('/v1/cmd', function(req, res){

    net.cmd(req.body.cmd, function(){
        res.status(204);
        res.end();
    }, function(){
        res.status(500);
        res.end();
    });

});


module.exports = router;
