$(document).ready(function() {
  $('.ui.checkbox').checkbox();
  $('[name=wilddog]').val(localStorage.url || '');
  localStorage.privateKey ? $('[type=password]').attr('placeholder','change password...?') : null;


  $('[name=wilddog]').on('input', function() {
    var a = $(this).val().replace(/^https?:\/\//ig, '');
    a = a.split('/')[0];
    a = (a != $(this).val()) ? $(this).val(a) : null;
  });
  $('.button.positive').on('click', function() {
    var that = $(this);
    if (that.hasClass('loading'))
      return;
    localStorage.url = $('[name=wilddog]').val();
    that.addClass('loading disabled');
    var port = chrome.runtime.connect({
      name: "sendKey"
    });
    port.postMessage({
      key: $('[type=password]').val()
    });
    port.onMessage.addListener(function(result) {
      that.removeClass('loading disabled');
      if (result.msg == 'ok') {
        $('.ui.dimmer .ui.header').removeClass('red').addClass('green');
        $('.ui.dimmer i.icon').removeClass('remove').addClass('checkmark');
        $('.dimmer.text').text('Success Message!');
        $('.ui.dimmer')
          .dimmer('show');
      } else {
        $('.ui.dimmer .ui.header').removeClass('green').addClass('red');
        $('.ui.dimmer i.icon').removeClass('checkmark').addClass('remove');
        $('.dimmer.text').text('Network error!');
        $('.ui.dimmer')
          .dimmer('show');
      }
      setTimeout(function() {
        $('.ui.dimmer')
          .dimmer('hide');
      }, 1000);
    });


  });
});
