angular.module('app')
    .factory('ideService', ['$resource', function($resource){
        return $resource('/v1', {}, {
            connect: {
                method: 'POST',
                url: '/v1/connect'
            },
            cmd: {
                method: 'POST',
                url: '/v1/cmd'
            }
        });
    }]);