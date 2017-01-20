// @see https://github.com/likkrit

var popUp = {
  // 拿出指定id的条目
  getItem: function(id) {
    var port = chrome.runtime.connect({
      name: "getItem"
    });
    port.postMessage({
      id: id
    });
    port.onMessage.addListener(function(result) {
      // 获取成功后进入page页面
      if (result.msg == 'ok') {
        $('#page').transition('scale');
        $('#items').transition('hide');
        $('#add').css({
          'visibility': 'hidden'
        });
        $('#back').css({
          'visibility': 'visible'
        });
        popUp.renderPage(result.item);
      } else {
        popUp.showTip('error!');
      }
    });
  },
  getItemsFromBackground: function(url) {
    $('#items .dimmer').dimmer('is active') ? null : $('#items .dimmer').dimmer('show');

    var port = chrome.runtime.connect({
      name: "getItems"
    });
    port.postMessage({
      url: url
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        popUp.render(result.items);
      } else {
        $('#items .dimmer').dimmer('is active') ? $('#items .dimmer').dimmer('hide') : null;
        popUp.showTip('error!');
      }
    });
  },
  insertContentScript: function(id) {
    chrome.runtime.sendMessage({
      type: "insertContentScript",
      id: id
    });
    window.close();
  },

  // 显示条目
  render: function(response) {
    var oriItemStr = document.querySelector('#items').innerHTML;
    var itemStr = '<div class="ui inverted dimmer active"><div class="ui text loader">Loading</div></div>';
    response = response || [];
    popUp.items = response;
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
      itemStr += response[i].userName;
      itemStr += '</p>';
      itemStr += '</div>';
      itemStr += '</div>';
      itemStr += '</div>';
    }
    if (response.length === 0){
      itemStr += '<div class="none_tip center"><h3 class="ui grey icon header empty"><i class="sticky note outline icon"></i><span class="dimmer text">Empty List</span></h3></div>'
      document.querySelector('#items').innerHTML = itemStr;

    }
    else if (oriItemStr != itemStr) {
      document.querySelector('#items').innerHTML = itemStr;
    }

    $('#items .dimmer').dimmer('is active') ? $('#items .dimmer').dimmer('hide') : null;
  },
  // 增加一个条目
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
            popUp.getItemsFromBackground(tab.url || "");
          });
      } else {
        popUp.showTip('Network error!');
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
            popUp.getItemsFromBackground(tab.url || "");
          });
      } else {
        popUp.showTip('Network error!');
      }
    });
  },
  showTip: function(type) {
    // 错误类型
    if (type) {
      $('.page.dimmer .ui.header').removeClass('green').addClass('red');
      $('.page.dimmer i.icon').removeClass('checkmark').addClass('remove');
      $('.page .dimmer.text').text('Network error!');
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


function hiddenPassword(str) {
  if (str && str.length > 1) {
    var xing = '';
    for (var i = 0; i < str.length - 2; i++) {
      xing += '*';
    }
    return str.charAt(0) + xing + str.charAt(str.length - 1);
  }
}
