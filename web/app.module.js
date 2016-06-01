require([
  'jquery', 
  'angular', 
  'angularRoute', 
  'app.services', 
  'app.controller', 
  'app.utils', 
  'timeline/timeline.module', 
  'bootstrap'], 
function($, angular, ngRoute, services, controllers, utils) {
  var moduleName = 'meanBookApp';
  var module = angular.module(moduleName, [ 'timeline', 'ngRoute' ]);
  // Configuration for Spring Restful API on Wildfly (Java Server).
  // module.value('meanBookApiUrl', 'http://localhost:8080/meanbook-spring');
  module.value('meanBookApiUrl', utils.getCurrentHostName() + '/api/1.0');
  module.value('defaultLoadUsersTimeout', 15 * 1000);
  module.service('meanBookApi', services.meanBookApi);
  module.service('messageService', services.messageService);
  module.service('userService', services.userService);
  module.controller('meanBookController', controllers.meanBookController);

  module.config([
    '$locationProvider', 
    '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      
      $routeProvider.when('/timeline', {
        templateUrl: 'timeline/timeline.template.html'
      }).when('/user-profile', {
        templateUrl: 'user-profile/user-profile.template.html'
      }).otherwise('/timeline');
      console.log('[Angular]: Config block executed.');
    }
  ]);
  module.run(function(userService, onlineUsersService, timelineService) {
    userService.loadCurrentUser(function(responseData) {
      onlineUsersService.startPulling();
      timelineService.loadPosts(responseData.username);
      console.log('[Angular]: Run block executed. Loaded current user.');
    });
    console.log('[Angular]: Run block executed.');
  });

  angular.element(document).ready(function() {
    angular.bootstrap(document, [moduleName]);
    console.log('[Angular]: Bootstrapped.');
  });
});
