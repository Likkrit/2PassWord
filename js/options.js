$(document).ready(function() {
  $('.ui.checkbox').checkbox();
  $('[name=wilddog]').val(localStorage.url || '');
  localStorage.privateKey ? $('[type=password]').attr('placeholder', 'change password...?') : null;

  // 输入框正则匹配事件
  $('[name=wilddog]').on('input', function() {
    return;
    var a = $(this).val().replace(/^https?:\/\//ig, '');
    // a = a.split('/')[0];
    a = a.replace(/\s/ig, '');
    a = (a != $(this).val()) ? $(this).val(a) : null;
  });

  // 提交按钮点击事件
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
        $('.inverted.dimmer .ui.header').removeClass('red').addClass('green');
        $('.inverted.dimmer i.icon').removeClass('remove').addClass('checkmark');
        $('.dimmer.text').text('Success Message!');
        $('.inverted.dimmer')
          .dimmer('show');
      } else {
        $('.inverted.dimmer .ui.header').removeClass('green').addClass('red');
        $('.inverted.dimmer i.icon').removeClass('checkmark').addClass('remove');
        $('.dimmer.text').text('Network error!');
        $('.inverted.dimmer')
          .dimmer('show');
      }
      setTimeout(function() {
        $('.inverted.dimmer')
          .dimmer('hide');
      }, 1000);
    });
  });

  // 重设锁屏密码按钮
  $('.reset_h5lock').on('click', function() {
    new H5lock({
      container: 'h5lock',
      backgroundStyle: 'transparent',
      fillStyle: '#ffffff',
      strokeStyle: '#ffffff',
      type: 'reset',
      // 重设成功后 回调函数
      reset: function(lockKey) {
        $('.h5lock_container').dimmer('hide');
        $('.reset_h5lock').text('更改手势密码');
        $('.remove_h5lock').show();
        chrome.runtime.sendMessage({
          type: "resetLockKey",
          lockKey: lockKey
        });
      }
    }).init();
    $('.h5lock_container').dimmer({
      closable: false,
    }).dimmer('show');
  });

  // 移除锁屏密码
  $('.remove_h5lock').on('click', function() {
    chrome.runtime.sendMessage({
        type: "resetLockKey",
        lockKey: ''
      },
      function(response) {
        localStorage.removeItem('passwordxx');
        $('.remove_h5lock').hide();
        $('.reset_h5lock').text('添加手势密码');
      });
  });

  //init
  if(localStorage.passwordxx){
    $('.reset_h5lock').text('更改手势密码');
    $('.remove_h5lock').show();
  }
});

// 获取状态
function getStatus(callback) {
  chrome.runtime.sendMessage({
    type: "getStatus",
  }, function(response) {
    callback(response);
  });
}
getStatus(function(response) {
  switch (response.msg) {
    case 'lock':
      // 如果是锁屏状态，则渲染解锁界面
      // 初始化函数
      $('.h5lock_container').dimmer({
        closable: false,
      }).dimmer('show');
      //则渲染解锁界面
      new H5lock({
        container: 'h5lock',
        backgroundStyle: 'transparent',
        fillStyle: '#ffffff',
        strokeStyle: '#ffffff',
        // 解锁成功后 回调函数
        unlock: function(lockKey) {
          $('.h5lock_container').dimmer('hide');
          $('.reset_h5lock').text('更改手势密码');
          $('.remove_h5lock').show();
          chrome.runtime.sendMessage({
            type: "unLock",
            lockKey: lockKey
          });
        }
      }).init();
      break;
    default:
      break;
  }
});
