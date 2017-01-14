// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


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
  getItemJSONFromPopUp: function(id) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id == id) {
        return JSON.stringify(this.items[i]);
      }
    }
    return null;
  },
  getItemsFromBackground: function(url) {
    chrome.runtime.sendMessage({
        type: "getItems",
        url: url
      },
      function(response) {
        popUp.render(response);
      });
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
  refreshItems: function() {
    document.querySelector('.record strong').innerHTML = "?";

    var port = chrome.runtime.connect({
      name: "pullItems"
    });
    port.postMessage({
      data: 'go'
    });
    port.onMessage.addListener(function(result) {
      console.log(result);
      if (result.msg == 'ok') {
        document.querySelector(".successTip").className = "successTip";
        setTimeout(function() {
          document.querySelector(".successTip").className = "successTip hide";
          popUp.render(result.items);
        }, 700);
      }
    });
  },
  // 显示条目
  render: function(response) {
    var itemStr = '',
      availableNum = 0;
    response = response || [];
    popUp.items = response;
    for (var i = 0; i < response.length; i++) {
      if (response[i].available) {
        availableNum++;
        itemStr += '<div class="item available" data-id=' + response[i].id + '>';
      } else {
        itemStr += '<div class="item" data-id=' + response[i].id + '>';
      }
      itemStr += '<span class="name">' + response[i].name + '</span>';
      itemStr += '<span class="username">' + response[i].userName + '</span>';
      if (response[i].inputId1 && response[i].inputId2 && response[i].available) {
        itemStr += '<div class="insert-box"><span class="button insert">填入</span></div>';
      } else if (response[i].inputId1 && response[i].inputId2) {
        itemStr += '<div class="insert-box"><span class="button button-default insert">填入</span></div>';
      }
      itemStr += '</div>';
    }
    document.querySelector('.items').innerHTML = itemStr;

    // if(availableNum)
    document.querySelector('.record strong').innerHTML = i;

    document.querySelector('.box .items').style.opacity = 1;
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
      console.log(result);
      if (result.msg == 'ok') {
        document.querySelector(".successTip").className = "successTip";
        setTimeout(function() {
          document.querySelector(".successTip").className = "successTip hide";
          // 重新拿数据
          popUp.getItemsFromBackground(popUp.url);
          popUp.outDetailPage();
        }, 700);
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
        document.querySelector(".successTip").className = "successTip";
        setTimeout(function() {
          document.querySelector(".successTip").className = "successTip hide";
          // 重新拿数据
          popUp.getItemsFromBackground(popUp.url);
          popUp.outDetailPage();
        }, 700);
      }
    });
  },
  enterDetailPage: function(obj) {
    popUp.renderItemDetail(obj);
    document.querySelector(".title-text").style.display = "none";
    document.querySelector(".title-add-item").style.display = "none";
    document.querySelector(".title-back").style.display = "inline";

    document.querySelector(".items").style.display = "none";
    document.querySelector(".item-detail").style.display = "block";
  },

  outDetailPage: function() {
    popUp.renderItemDetail({
      name: '',
      userName: '',
      passWord: '',
      inputId1: '',
      inputId2: ''
    });

    document.querySelector(".title-text").style.display = "";
    document.querySelector(".title-add-item").style.display = "inline-block";
    document.querySelector(".title-back").style.display = "none";
    document.querySelector(".items").style.display = "block";
    document.querySelector(".item-detail").style.display = "none";
  },
  renderItemDetail: function(obj) {
    document.querySelector(".item-detail .id").value = obj.id || '';
    document.querySelector(".item-detail .name").value = obj.name || '';
    document.querySelector(".item-detail .user-name").value = obj.userName || '';
    document.querySelector(".item-detail .pass-word").value = obj.passWord || '';
    document.querySelector(".item-detail .other").value = obj.other || '';
    document.querySelector(".item-detail .host").value = obj.host || '';
    document.querySelector(".item-detail .input-id1").value = obj.inputId1 || '';
    document.querySelector(".item-detail .input-id2").value = obj.inputId2 || '';
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
