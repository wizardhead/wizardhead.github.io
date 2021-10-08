(function () {
    'use strict';

    (function () {
      var sitemenu = document.querySelector('.sitemenu');
      var expander = document.querySelector('.sitemenu .expander');
      expander.addEventListener('click', function (event) {
        sitemenu.classList.toggle('responsive');
        event.preventDefault();
      });
    })();

}());
//# sourceMappingURL=scripts.js.map
