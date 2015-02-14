'use strict';

var CreateAccountCtrl = function($scope, $location, $routeParams, $q, auth, admin, appConfig, mailConfig) {
    !$routeParams.dev && !auth.isInitialized() && $location.path('/'); // init app

    // init phone region
    $scope.region = 'DE';
    $scope.domain = '@' + appConfig.config.wmailDomain;

    $scope.createWhiteoutAccount = function() {
        if ($scope.form.$invalid) {
            $scope.errMsg = 'Please fill out all required fields!';
            return;
        }

        return $q(function(resolve) {
            $scope.busy = true;
            $scope.errMsg = undefined; // reset error msg
            resolve();

        }).then(function() {
            // read form values
            var emailAddress = $scope.user + $scope.domain;
            var phone = PhoneNumber.Parse($scope.dial, $scope.region);
            if (!phone || !phone.internationalNumber) {
                throw new Error('Invalid phone number!');
            }

            // set to state for next view
            auth.setCredentials({
                emailAddress: emailAddress,
                password: $scope.pass,
                realname: $scope.realname
            });

            // call REST api
            return admin.createUser({
                emailAddress: emailAddress,
                password: $scope.pass,
                phone: phone.internationalNumber,
                betaCode: $scope.betaCode.toUpperCase()
            });

        }).then(function() {
            $scope.busy = false;
            // proceed to login and keygen
            $location.path('/validate-phone');

        }).catch(function(err) {
            $scope.busy = false;
            $scope.errMsg = err.errMsg || err.message;
        });
    };

    $scope.loginToExisting = function() {
        return $q(function(resolve) {
            $scope.busy = true;
            $scope.errMsg = undefined; // reset error msg
            resolve();

        }).then(function() {
            return mailConfig.get('user' + $scope.domain);

        }).then(function(config) {
            $scope.busy = false;
            $scope.state.login = {
                mailConfig: config
            };

            $location.path('/login-set-credentials');

        }).catch(function() {
            $scope.busy = false;
            $scope.errMsg = 'Error fetching IMAP settings for wmail.io!';
        });
    };
};

module.exports = CreateAccountCtrl;