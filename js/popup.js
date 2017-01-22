// @see https://github.com/likkrit

var popUp = {
  // 从background获取item 只有成功没有失败
  getItem: function(id) {
    var port = chrome.runtime.connect({
      name: "getItem"
    });
    port.postMessage({
      id: id
    });
    port.onMessage.addListener(function(result) {
      // 进入page页面
      $('#page').transition('scale');
      $('#items').transition('hide');
      $('#add').css({
        'visibility': 'hidden'
      });
      $('#back').css({
        'visibility': 'visible'
      });
      popUp.renderPage(result.item);
    });
  },
  // 从background获取items 只有成功没有失败
  getItems: function(url) {
    var port = chrome.runtime.connect({
      name: "getItems"
    });
    port.postMessage({
      url: url
    });
    port.onMessage.addListener(function(result) {
      // 渲染列表
      popUp.render(result.items);
    });
  },
  // 插入contentScript 只有成功没有失败
  insertContentScript: function(id) {
    chrome.runtime.sendMessage({
      type: "insertContentScript",
      id: id
    });
    window.close();
  },

  // 解锁
  unLock: function(lockKey) {
    chrome.runtime.sendMessage({
      type: "unLock",
      lockKey: lockKey
    }, function(response) {
    });
  },

  // 增加一个item
  addItem: function(newItem) {
    var port = chrome.runtime.connect({
      name: "addItem"
    });
    port.postMessage({
      newItem: newItem
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        popUp.showTip();
        // 重新拿数据
        if (chrome && chrome.tabs)
          chrome.tabs.getSelected(function(tab) {
            popUp.getItems(tab.url || "");
          });
      } else {
        popUp.showTip(result.msg);
      }
    });
  },

  // 删除一个条目
  deleteItem: function(id) {
    var port = chrome.runtime.connect({
      name: "deleteItem"
    });
    port.postMessage({
      id: id
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        popUp.showTip();
        // 重新拿数据
        if (chrome && chrome.tabs)
          chrome.tabs.getSelected(function(tab) {
            popUp.getItems(tab.url || "");
          });
      } else {
        popUp.showTip(result.msg);
      }
    });
  },
  // 删除一个条目
  pullItems: function(callback) {
    var port = chrome.runtime.connect({
      name: "pullItems"
    });
    port.postMessage({});
    port.onMessage.addListener(function(result) {
      callback(result);
    });
  },
  // 显示列表
  render: function(response) {
    var oriItemStr = document.querySelector('#items .box').innerHTML;
    var itemStr = '';
    response = response || [];
    for (var i = 0; i < response.length; i++) {
      itemStr += '<div class="item" data-id=' + response[i].id + '>';
      if (response[i].available)
        itemStr += '<div class="right floated content"><div class="ui positive button insert">Add</div></div>';
      else {
        itemStr += '<div class="right floated content"><div class="ui button insert">Add</div></div>';
      }
      itemStr += '<div class="content">';
      itemStr += '<div class="header">';
      itemStr += response[i].name;
      itemStr += '</div>';
      itemStr += '<div class="meta"><p>';
      itemStr += response[i].userName || '';
      itemStr += '</p>';
      itemStr += '</div>';
      itemStr += '</div>';
      itemStr += '</div>';
    }

    //为空时显示empty页面
    if (response.length === 0) {
      itemStr += '<div class="none_tip center"><h3 class="ui grey icon header empty"><i class="sticky note outline icon"></i><span class="dimmer text">Empty List</span></h3></div>'
      document.querySelector('#items .box').innerHTML = itemStr;
      // 原来的列表页与将要渲染的不一样时 才进行渲染
    } else if (oriItemStr != itemStr) {
      document.querySelector('#items .box').innerHTML = itemStr;
    }
    // 去掉列表页的loading蒙层
    $('#items .dimmer').dimmer('is active') ? $('#items .dimmer').dimmer('hide') : null;
  },

  showTip: function(type) {
    // 错误类型
    if (type) {
      $('.page.dimmer .ui.header').removeClass('green').addClass('red');
      $('.page.dimmer i.icon').removeClass('checkmark').addClass('remove');
      $('.page .dimmer.text').text(type);
      $('#page form').removeClass('loading');
      $('.page.dimmer').dimmer('show');
      setTimeout(function() {
        $('.page.dimmer').dimmer('hide');
      }, 1000);
      return;
    }

    $('.page.dimmer .ui.header').removeClass('red').addClass('green');
    $('.page.dimmer i.icon').removeClass('remove').addClass('checkmark');
    $('.page .dimmer.text').text('Success Message!');

    $('#page form').removeClass('loading');
    $('.page.dimmer').dimmer('show');
    setTimeout(function() {
      $('.page.dimmer').dimmer('hide');
      popUp.renderPage({
        name: '',
        userName: '',
        passWord: '',
        inputId1: '',
        inputId2: ''
      });
      $('#page').transition('hide');
      $('#items').transition('fade right');
      $('#add').css({
        'visibility': 'visible'
      });
      $('#back').css({
        'visibility': 'hidden'
      });
    }, 1000);
  },
  renderPage: function(obj) {
    document.querySelector("[name=id]").value = obj.id || '';
    document.querySelector("[name=name]").value = obj.name || '';
    document.querySelector("[name=username]").value = obj.userName || '';
    document.querySelector("[name=password]").value = obj.passWord || '';
    document.querySelector("[name=other]").value = obj.other || '';
    document.querySelector("[name=host]").value = obj.host || '';
    document.querySelector("[name=input1]").value = obj.inputId1 || '';
    document.querySelector("[name=input2]").value = obj.inputId2 || '';
  }
};

function getStatus(callback) {
  chrome.runtime.sendMessage({
    type: "getStatus",
  }, function(response) {
    callback(response);
  });
}

function init() {
  // 获取当前标签页URL
  if (chrome && chrome.tabs) {
    chrome.tabs.getSelected(function(tab) {
      getStatus(function(response) {
        switch (response.msg) {
          // 如果background的状态是加载完毕的时候，拉取background里的items
          case 'loaded':
          if(localStorage.h5lock == 2 || (localStorage.h5lock == 1 && !response.unlocked)){
            new H5lock({
              container: 'h5lock',
              unlock: function(lockKey) {
                $('.h5lock_container').dimmer('hide');
                popUp.unLock(lockKey);
                popUp.getItems(tab.url || "");
              }
            }).init();
            $('.h5lock_container').dimmer('show');
          }
          else{
            popUp.getItems(tab.url || "");
          }
            break;
          case 'noKey':
          case 'noUrl':
            $('#items .dimmer').dimmer('is active') ? null : $('#items .dimmer').dimmer('show');
            $('#items .dimmer').dimmer('is active') ? $('#items .dimmer').dimmer('hide') : null;
            popUp.showTip('请先输入密钥或URL');
            break;
          case 'loading':
            // 如果正在加载中，则1.5秒后再来光顾
            setTimeout(function() {
              init();
            }, 1500);
            break;
          case 'network error':
            // 如果网络错误，则主动尝试一次网络请求，如果失败提示错误信息
            popUp.pullItems(function(result) {
              if (result.msg == 'ok') {
                popUp.getItems(tab.url || "");
              } else {
                $('#items .dimmer').dimmer('is active') ? null : $('#items .dimmer').dimmer('show');
                $('#items .dimmer').dimmer('is active') ? $('#items .dimmer').dimmer('hide') : null;
                popUp.showTip(response.msg);
              }
            })
            break;
          default:
            break;
        }
      });
    });
  }
}
