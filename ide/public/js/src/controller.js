angular.module('app', [
    'ngResource'
])
    .directive('myEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.myEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })
    .run([function(){
        window.socket = io();
        window.socket.on('log', function(data){
            $("#cmd-input").after("<pre>"+data+"</pre>");
        });
    }])
    .controller('ideCtrl', ['$scope', 'ideService', function($scope, ideService){

        $scope.board = {
            disabled: false,
            address: '',
            connect: function(){
                if($scope.board.address.indexOf(':') > 0) {
                    window.localStorage.setItem("address", $scope.board.address);
                    var addr = $scope.board.address.split(':');

                    ideService.connect({}, {
                        ip: addr[0],
                        port: addr[1]
                    }, function(){
                        $scope.board.disabled = true;
                        $scope.command.disabled = false;
                    });
                }
            }
        };

        $scope.command = {
            disabled: true,
            cmd: '',
            send: function(){
                if($scope.command.cmd != '') {
                    ideService.cmd({}, {
                        cmd: $scope.command.cmd
                    });
                    $scope.command.cmd = '';
                }
            }
        };

        if(window.localStorage.getItem('address')) {
            $scope.board.address = window.localStorage.getItem('address');
        }

    }]);