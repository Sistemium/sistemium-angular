'use strict';

(function () {

  function saEtc($window, $timeout, $rootScope) {

    function debounce(fn, timeout, scope = $rootScope) {
      return _.debounce(function () {

        const args = arguments;

        scope.$applyAsync(() => {
          fn.apply(null, args);
        });

      }, timeout);
    }

    function blurActive() {
      return _.result($window.document, 'activeElement.blur');
    }

    function focusElementById(id, timeout) {
      $timeout(function () {

        let element = $window.document.getElementById(id);
        if (element) {
          element.focus();
        }

      }, timeout || 0);
    }

    function getElementById(id) {
      return $window.document.getElementById(id);
    }

    function scrolTopElementById(id) {
      let element = getElementById(id);
      if (!element) {
        return;
      }
      element.scrollTop = 0;
    }

    function scrollBottomElementById(id) {
      let element = getElementById(id);
      if (!element) {
        return;
      }
      element.scrollTop = element.scrollHeight;
    }

    function setCookie(name, value, props = {}) {

      let exp = props.expires;

      if (_.isNumber(exp) && exp) {

        let d = new Date();

        d.setTime(d.getTime() + exp * 1000);

        exp = props.expires = d;

      }

      if (exp && exp.toUTCString) {
        props.expires = exp.toUTCString();
      }

      value = $window.encodeURIComponent(value);

      let updatedCookie = name + "=" + value;

      _.each(props, (propValue, propName) => {

        updatedCookie += "; " + propName;

        if (propValue !== true) {
          updatedCookie += "=" + propValue;
        }

      });

      $window.document.cookie = updatedCookie;

    }

    function getCookie(name) {

      let preRe = `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`;
      let matches = document.cookie.match(new RegExp(preRe));

      if (matches) {
        return $window.decodeURIComponent(matches[1]);
      }

    }

    function deleteCookie(name) {

      setCookie(name, null, {expires: -1});

    }

    return {
      getCookie,
      setCookie,
      deleteCookie,
      debounce,
      scrolTopElementById,
      getElementById,
      blurActive,
      focusElementById,
      scrollBottomElementById
    };

  }

  angular.module('sistemium.services')
    .service('saEtc', saEtc);

})();
