angular.module('app', [
    'ngResource'
])
    .directive('onReadFile', function ($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);


                element.on('change', function(onChangeEvent) {

                    var file = (onChangeEvent.srcElement || onChangeEvent.target).files[0];
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        scope.$apply(function() {
                            fn(scope, {
                                $fileContent:onLoadEvent.target.result,
                                $name: file.name
                            });
                        });
                    };

                    reader.readAsText(file);
                });
            }
        };
    })
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

        $scope.writeLine = function(){
            if($scope.fileContent.length > 0) {
                var line = $scope.fileContent.shift().replace(/["]/g, '\\"');


                //if(line.length == 0) {
                //    $scope.writeLine();
                //    return;
                //}

                ideService.cmd({}, {
                    cmd: 'file.writeline("'+line+'")'
                }, function(){
                    $scope.writeLine();
                });
            } else {
                ideService.cmd({}, {
                    cmd: 'file.close()'
                }, function(){
                    $scope.remoteFile.list();
                });
            }
        };

        $scope.remoteFile = {
            showContent: function(content, fileName){
                //console.log(fileName, content);
                //return;
                $scope.fileContent = content.split("\n");
                //debugger;
                //ideService.cmd({}, {
                //    cmd: 'file.remove("'+fileName+'");'
                //}, function(){
                        ideService.cmd({}, {
                            cmd: 'file.open("'+fileName+'", "w+")'
                        }, function(){
                            $scope.writeLine();
                        });
                //});
            },
            list: function(){
                var cmd = "local l = file.list();for name,size in pairs(l) do printc(name) end";
                ideService.cmd({}, {
                    cmd: cmd
                });
            }
        };


    }]);