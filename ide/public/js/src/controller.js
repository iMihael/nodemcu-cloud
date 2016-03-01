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

        $scope.writeLine = function(fileName){
            if($scope.fileContent.length > 0) {


                var line = $scope.fileContent.shift().replace(/["]/g, '\\"');

                line = line.replace(/\\n/g, "\\\\n");
                console.log(line);

                ideService.cmd({}, {
                    cmd: 'file.writeline("'+line+'");file.flush();'
                }, function(){
                    $scope.writeLine(fileName);
                });
            } else {
                ideService.cmd({}, {
                    cmd: 'file.close()'
                }, function(){
                    $scope.remoteFile.list();
                });
            }
        };

        $scope.readLine = function(download, fileName){
            ideService.cmdRsp({}, {
                cmd: 'printc(file.readline())',
            }, function(data){
                data = data.data;

                $scope.fileContent += data.replace(/\n\n/g, "\n");
                $scope.readLine(download, fileName);

            }, function(){
                ideService.cmd({}, {
                    cmd: "file.close()"
                }, function(){
                    if(download) {
                        downloadText(fileName, $scope.fileContent);
                    } else {
                        $("#cmd-input").after("<pre>" + $scope.fileContent + "</pre>");
                        $scope.editor.setValue($scope.fileContent, 0);
                    }
                });
            });
        };

        var downloadText = function(filename, text) {
            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', filename);

            if (document.createEvent) {
                var event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                pom.dispatchEvent(event);
            }
            else {
                pom.click();
            }
        };

        $scope.remoteFile = {
            shownFile: false,
            canSave: false,
            saveFile: function(){
                $scope.fileContent = $scope.editor.getValue().split("\n");

                ideService.cmd({}, {
                    cmd: 'file.open("'+$scope.remoteFile.shownFile+'", "w+")'
                }, function(){
                    $scope.writeLine($scope.remoteFile.shownFile);
                });
            },
            showContent: function(content, fileName){
                $scope.fileContent = content.split("\n");

                ideService.cmd({}, {
                    cmd: 'file.open("'+fileName+'", "w+")'
                }, function(){
                    $scope.writeLine(fileName);
                });

            },
            show: function(fileName){
                if(!fileName) {
                    fileName = prompt("Enter file name");
                }
                if(fileName && fileName != "") {
                    $scope.remoteFile.shownFile = fileName;
                    $scope.remoteFile.canSave = true;
                    ideService.cmd({}, {
                        cmd: 'file.open("' + fileName + '", "r")'
                    }, function(){
                        $scope.fileContent = '';
                        $scope.readLine(false);
                    });
                }
            },
            remove: function(){
                var fileName = prompt("Enter file name");
                if(fileName && fileName != "") {
                    ideService.cmd({}, {
                        cmd: 'file.remove("' + fileName + '")'
                    }, function(){
                        $scope.remoteFile.list();
                    });
                }
            },
            download: function(){
                var fileName = prompt("Enter file name");
                if(fileName && fileName != "") {
                    ideService.cmd({}, {
                        cmd: 'file.open("' + fileName + '", "r")'
                    }, function(){
                        $scope.fileContent = '';
                        $scope.readLine(true, fileName);
                    });
                }
            },
            list: function(){
                var cmd = "local l = file.list();for name,size in pairs(l) do printc(name) end";
                ideService.cmd({}, {
                    cmd: cmd
                });
            }
        };

        $scope.editor = ace.edit("editor");
        $scope.editor.setTheme("ace/theme/monokai");
        $scope.editor.getSession().setMode("ace/mode/lua");



    }]);