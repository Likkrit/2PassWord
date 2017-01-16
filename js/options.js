$(document).ready(function() {
  $('.ui.checkbox').checkbox();
  $('[name=wilddog]').val(localStorage.url || '');
  $('[type=password]').val(localStorage.privateKey || '');

  $('[name=wilddog]').on('input', function() {
    var a = $(this).val().replace(/^https?:\/\//ig, '');
    a = (a != $(this).val()) ? $(this).val(a) : null;
  });

  $('.button.positive').on('click', function() {
    var that = $(this);
    if(that.hasClass('loading'))
      return;
    localStorage.url = $('[name=wilddog]').val();
    localStorage.privateKey = $('[type=password]').val();
    that.addClass('loading disabled');
    var port = chrome.runtime.connect({
      name: "sendKey"
    });
    port.postMessage({
      key: localStorage.privateKey
    });
    port.onMessage.addListener(function(result) {
      that.removeClass('loading disabled');
      if (result.msg == 'ok') {
        $('.ui.dimmer')
          .dimmer('show')
        ;
      }
    });


  });
});
