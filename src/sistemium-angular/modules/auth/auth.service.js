'use strict';

(function () {

  function AuthService($location,
                       $http,
                       $q,
                       saToken,
                       appConfig,
                       Util,
                       Account,
                       $rootScope) {

    var safeCb = Util.safeCb;
    var currentUser = {};
    var userRoles = appConfig.userRoles || [];

    if (saToken.get() && $location.path() !== '/logout') {
      currentUser = Account.find('me');
      currentUser.then(function (res) {
        Account.loadRelations(res, ['providerAccount']).then(function () {
          currentUser = res;
        });
        console.log('logged-in', res);
        $rootScope.$broadcast('logged-in');
      });
    }

    var Auth = {

      loginWithMobileNumber: function (mobileNumber) {

        return $http.get('/auth/pha/' + mobileNumber);

      },

      authWithSmsCode: function (id, code) {

        return $http.get('/auth/pha/' + id + '/' + code)
          .then(function (res) {
            var token = res.headers('x-access-token');
            return {
              token: token,
              user: res.data
            };
          });

      },

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional, function(error, user)
       * @return {Promise}
       */
      login: function (token, callback) {
        return $http.get('/api/token/' + token, {
            headers: {
              'authorization': token
            }
          })
          .then(function (user) {
            currentUser = user.data;
            saToken.save(token);
            safeCb(callback)(null, currentUser);
            $rootScope.$broadcast('logged-in');
            return currentUser;
          })
          .catch(function (err) {
            Auth.logout();
            safeCb(callback)(err.data);
            return $q.reject(err.data);
          });
      },

      /**
       * Delete access token and user info
       */
      logout: function () {
        saToken.destroy();
        currentUser = {};
        $rootScope.$broadcast('logged-off');
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional, function(error, user)
       * @return {Promise}
       */
      createUser: function (user, callback) {
        return Account.create(user).then(
          function (data) {
            saToken.save(data.token);
            currentUser = Account.find('me');
            return safeCb(callback)(null, user);
          },
          function (err) {
            Auth.logout();
            return safeCb(callback)(err);
          });
      },

      /**
       * Gets all available info on a user
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, funciton(user)
       * @return {Object|Promise}
       */
      getCurrentUser: function (callback) {
        if (arguments.length === 0) {

          return currentUser;
        }

        var value = (currentUser.hasOwnProperty('$$state')) ?
          currentUser : currentUser;
        return $q.when(value)
          .then(function (user) {
            safeCb(callback)(user);
            return user;
          }, function () {
            safeCb(callback)({});
            return {};
          });
      },

      /**
       * Check if a user is logged in
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isLoggedIn: function (callback) {
        if (arguments.length === 0) {
          return currentUser.hasOwnProperty('roles');
        }

        return Auth.getCurrentUser(null)
          .then(function (user) {
            var is = user.hasOwnProperty('roles');
            safeCb(callback)(is);
            return is;
          });
      },

      /**
       * Check if a user has a specified role or higher
       *   (synchronous|asynchronous)
       *
       * @param  {String}     role     - the role to check against
       * @param  {Function|*} callback - optional, function(has)
       * @return {Bool|Promise}
       */
      hasRole: function (role, callback) {
        var hasRole = function (r, h) {
          return userRoles.indexOf(r) >= userRoles.indexOf(h);
        };

        if (arguments.length < 2) {
          return hasRole(currentUser.role, role);
        }

        return Auth.getCurrentUser(null)
          .then(function (user) {
            var has = (user.hasOwnProperty('roles')) ?
              hasRole(user.roles, role) : false;
            safeCb(callback)(has);
            return has;
          });
      },

      /**
       * Check if a user is an admin
       *   (synchronous|asynchronous)
       *
       * @param  {Function|*} callback - optional, function(is)
       * @return {Bool|Promise}
       */
      isAdmin: function () {
        return Auth.hasRole
          .apply(Auth, [].concat.apply(['admin'], arguments));
      },

      /**
       * Get auth token
       *
       * @return {String} - a token string used for authenticating
       */
      getToken: function () {
        return saToken.get();
      }
    };

    return Auth;
  }

  angular.module('sistemium.auth')
    .factory('saAuth', AuthService);

})();