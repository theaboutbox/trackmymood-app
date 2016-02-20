/* global AWS */
(function() {
    'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($timeout, $log, toastr, $scope, appSettings) {
        var vm = this;
        vm.reportMood = reportMood;

        activate();

        function activate() {
            vm.moods = getMoods();
            $scope.$on('event:google-plus-signin-success', function (event,authResult) {
                console.log("Success",authResult);
                var id_token = authResult.getAuthResponse().id_token;
                console.log("Token: ",id_token);

            });
            $scope.$on('event:google-plus-signin-failure', function (event,authResult) {
                console.log("Failed",authResult);
            });
        }

        function getMoods() {
            return [
                {title: "Happy", description: "I'm on top of the world!", image: "happy.png"},
                {title: "Apathetic", description: 'Meh.', image: "meh.png"},
                {title: "Sad", description: "Bah, Humbug!", image: "sad.png"}
            ];
        }

        function reportMood(mood) {
            // Initialize the Amazon Cognito credentials provider
            AWS.config.region = appSettings.cognito.region;
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: appSettings.cognito.identityPoolId
            });
            console.log(AWS.config);

            toastr.clear();
            $log.log("Mood is",mood.title);
            // Report it here
            toastr.success("Thank you for telling us how you feel","Big Brother Says");
        }

    }
})();
