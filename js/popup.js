// @see https://github.com/likkrit

var popUp = {
  url: '',
  items: [],
  // 从当前数据中拿出制定id的条目
  sendKey : function(key){
    var port = chrome.runtime.connect({
      name: "sendKey"
    });
    port.postMessage({
      key: key
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        popUp.render(result.items);
      }
    });
  },

  getItemsFromBackground: function(url) {
    var port = chrome.runtime.connect({
      name: "getItems"
    });
    port.postMessage({
      url: url
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        popUp.render(result.items);
      }
      else{
        popUp.showTip('error!');
      }
    });
  },
  getItemJSONFromPopUp: function(id) {
    console.log(this.items);
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id == id) {
        return JSON.stringify(this.items[i]);
      }
    }
    return null;
  },
  // 获取条目详情
  getItemFromPopUp: function(dataId) {
    for (var i = 0; i < popUp.items.length; i++) {
      if (dataId == popUp.items[i].id) {
        return (popUp.items[i]);
      }
    }
  },
  // 从服务器重新抓取数据
  pullItems: function() {
    var port = chrome.runtime.connect({
      name: "pullItems"
    });
    port.postMessage({
      data: 'go'
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        popUp.render(result.items);
      }
    });
  },

  // 显示条目
  render: function(response) {
    var itemStr = '';
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
    document.querySelector('#items').innerHTML = itemStr;

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
        popUp.getItemsFromBackground();
      }
      else{
        popUp.showTip('Network error!');
      }
    });
  },

  // 删除一个条目
  deleteItem: function(itemId) {
    var port = chrome.runtime.connect({
      name: "deleteItem"
    });
    port.postMessage({
      itemId: itemId
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        popUp.showTip();
        popUp.getItemsFromBackground();
      }
      else{
        popUp.showTip('Network error!');
      }
    });
  },

  showTip : function(type){
    if(type){
      $('.ui.dimmer .ui.header').removeClass('green').addClass('red');
      $('.ui.dimmer i.icon').removeClass('checkmark').addClass('remove');
      $('.dimmer.text').text('Network error!');

      $('#page form').removeClass('loading');
      $('.ui.dimmer')
        .dimmer('show')
      ;
      return;
    }

    $('.ui.dimmer .ui.header').removeClass('red').addClass('green');
    $('.ui.dimmer i.icon').removeClass('remove').addClass('checkmark');
    $('.dimmer.text').text('Success Message!');

    $('#page form').removeClass('loading');
    $('.ui.dimmer')
      .dimmer('show')
    ;
    setTimeout(function() {
      $('.ui.dimmer')
        .dimmer('hide')
      ;
      popUp.renderPage({
        name: '',
        userName: '',
        passWord: '',
        inputId1: '',
        inputId2: ''
      });
      $('#page')
        .transition('hide');
      $('#items')
        .transition('fade right');
      $('#add')
        .css({
          'visibility': 'visible'
        });
      $('#back')
        .css({
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
