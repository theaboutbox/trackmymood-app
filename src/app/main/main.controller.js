/* global AWS */
(function() {
    'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($q, $timeout, $log, toastr, $scope, appSettings) {
        var vm = this;
        var idToken;
        var userEmail;

        vm.reportMood = reportMood;

        activate();

        function activate() {
            vm.moods = getMoods();
            $scope.$on('event:google-plus-signin-success', function (event,authResult) {
                console.log("Success",authResult);
                idToken = authResult.getAuthResponse().id_token;
                console.log("Token: ",idToken);
                userEmail = authResult.getBasicProfile().getEmail();
                console.log("Email: ",userEmail);

            });
            $scope.$on('event:google-plus-signin-failure', function (event,authResult) {
                console.log("Failed",authResult);
            });

            $log.log("Settings",appSettings);
        }

        function getMoods() {
            return [
                {title: "Happy", description: "I'm on top of the world!", image: "happy.png"},
                {title: "Apathetic", description: 'Meh.', image: "meh.png"},
                {title: "Sad", description: "Bah, Humbug!", image: "sad.png"}
            ];
        }

        function reportMood(mood) {
            var insert = 'mutation newEvent { ' +
                    'event: createEvent(username:"'+userEmail+'", mood:"'+mood.title+'") {' +
                    'username,mood,created } }';
            $log.log("insertStatement",insert);
            getApiClient().
                then(function(client) {
                    client.resourceGraphqlPost({},insert,{}).
                        then(function(result) {
                            $log.log("Insert",result);
                        }).
                        catch(function(err) {
                            $log.log(err);
                        });
                }).
                catch(function(error) {
                    $log.log("Uh oh",error);
                });

            toastr.clear();
            $log.log("Mood is",mood.title);
            // Report it here
            toastr.success("Thank you for telling us how you feel","Big Brother Says");
        }

        function queryMoods() {
            var endTime = Math.floor(new Date().getTime() / 1000);
            var startTime = endTime - 3600 * 24 * 7;
            var query = '{ events(username: "' + userEmail + '", start:'+ startTime +', end:'+ endTime + ') { username, mood, created }}';
            getApiClient().
                then(function(client) {
                    client.resourceGraphqlPost({},query,{}).
                        then(function(result) {
                            $log.log(result);
                        }).
                        catch(function(err) {
                            $log.log(err);
                        });
                }).
                catch(function(error) {
                    $log.log("Uh oh",error);
                });
        }

        function getApiClient() {
            return $q(function(resolve,reject) {
                // Initialize the Amazon Cognito credentials provider
                AWS.config.region = appSettings.cognito.region;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: appSettings.cognito.identityPoolId,
                    AccountId: appSettings.aws.accountId,
                    RoleArn: appSettings.cognito.authenticatedRoleARN,
                    Logins: {
                        'accounts.google.com': idToken
                    },
                    LoginId: userEmail
                });

                AWS.config.credentials.get(function(err) {
                    var client = apigClientFactory.newClient({
                        accessKey: AWS.config.credentials.accessKeyId,
                        secretKey: AWS.config.credentials.secretAccessKey,
                        sessionToken: AWS.config.credentials.sessionToken
                    });
                    if (err) reject(err);
                    else resolve(client);
                });
            });
        }
    }
})();
