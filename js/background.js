
// 消息传递函数
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // if (sender.tab) {}  来自content script  sender.tab.url
  // if (request.type == "getItems") {
    // sendResponse(background.getItems(request.url));
  // } else if (request.type == "getItemDetail") {
  //   var a = background.getItemDetail(request.dataId);
  //   sendResponse(a);
  // }
// });


  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (sender.tab) {
      if (request.type == "getInput") {
        localStorage.pageInput1 = request.input1;
        localStorage.pageInput2 = request.input2;
        sendResponse({msg:'ok'});
      }
    }
  });


var connecting;
// 消息传递通道
chrome.runtime.onConnect.addListener(function(port) {
  connecting = true;
  if (port.name == "getItems") {
    port.onMessage.addListener(function(request) {
      background.getItems(request.url, function(result) {
        if (connecting){
          if(result.msg == 'ok'){
            port.postMessage({
              msg: "ok",
              items: result.items
            });
          }
          else{
            port.postMessage({
              msg: "error"
            });
          }
        }
      });
    });
  }
  else if (port.name == "addItem") {
    port.onMessage.addListener(function(request) {
      background.addItem(request.newItem, function(result) {
        if (connecting){
          if(result.msg == 'ok'){
            port.postMessage({
              msg: "ok"
            });
          }
          else{
            port.postMessage({
              msg: "error"
            });
          }
        }
      });
    });
  } else if (port.name == "deleteItem") {
    port.onMessage.addListener(function(request) {
      background.deleteItem(request.itemId, function(result) {
        if (connecting){
          if(result.msg == 'ok'){
            port.postMessage({
              msg: "ok"
            });
          }
          else{
            port.postMessage({
              msg: "error"
            });
          }
        }
      });
    });
  } else if (port.name == "pullItems") {
    port.onMessage.addListener(function(request) {
      background.pullItems(function() {
        if (connecting)
          port.postMessage({
            msg: "ok",
            items: background.items
          });
      });
    });
  }else if (port.name == "sendKey") {
    port.onMessage.addListener(function(request) {
      background.key = request.key;
      localStorage.privateKey = request.key;
      background.pullItems(function(result) {
        if (connecting)
          port.postMessage({
            msg: result.msg
          });
      });
    });
  }
  port.onDisconnect.addListener(function(port) {
    connecting = false;
  });
});

// 当一个标签加载完成时，此事件触发
// 用于显示当前浏览标签是否有记录下的用户名密码
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status != "loading") {
    return false;
  }
  var url = tab.url || "";
  if (!background.items)
    return;
  for (var i = 0; i < background.items.length; i++) {
    if (background.items[i].name && url.indexOf(background.items[i].name) > 0 || url.indexOf(background.items[i].host) > 0) {
      chrome.browserAction.setIcon({
        path: "images/page_64.png",
        tabId: tabId
      });
      return;
    }
  }
});


var background = {
  items: [],
  key : localStorage.privateKey,
  // url : '/collect-******',
  getDatabase : function(){
    var a = CryptoJS.MD5(background.key).toString().toUpperCase();
    a = 'http://' + localStorage.url + '/collect-'+ a.slice(a.length - 7);
    return a;
  },
  // 获取指定tab url的账户列表，列表根据url排序过
  getItems: function(url,callback) {
    if(this.items.length === 0){
      this.pullItems(callback);
      return;
    }
    if (url) {
      var items = [];
      var temp = clones(this.items);
      for (var i = 0; i < temp.length; i++) {
        if (url.indexOf(temp[i].name) > 0 || url.indexOf(temp[i].host) > 0) {
          temp[i].available = true;
          items.push(temp[i]);
        }
      }
      for (i = 0; i < temp.length; i++) {
        if (!temp[i].available) {
          items.push(temp[i]);
        }
      }
      callback({msg:'ok',items:items});
      return;
    }
    callback({msg:'ok',items:this.items});
  },
  // 从服务器刷新列表
  pullItems: function(callback) {
    var that = this;
    callback = callback || function(){};
    reqwest({
      url: background.getDatabase() + "/data.json?" + new Date().getTime(),
      // url: "/collect-******/data.json?" + new Date().getTime(),
      method: 'GET',
      success: function(response) {
        var i, temp, decrypted, name, host, updateTime, userName, passWord, other, inputId1, inputId2, newItem,
          items = [];
        for (i in response) {
          user = pw = other = '';
          temp = decodeURIComponent(response[i]);
          temp = JSON.parse(temp);

          name = temp.name || '';
          host = temp.host || '';
          updateTime = temp.updateTime || '';

          temp = DES.decrypt(temp.items, background.key) || '';
          temp = temp.split(',');

          userName = temp[0] || '';
          passWord = temp[1] || '';
          other = temp[2] || '';
          inputId1 = temp[3] || '';
          inputId2 = temp[4] || '';

          newItem = {
            "id": i,
            "name": name,
            "host": host,
            "updateTime": updateTime,
            "userName": userName,
            "passWord": passWord,
            "other": other,
            "inputId1": inputId1,
            "inputId2": inputId2,
          };
          items.push(newItem);
        }
        that.items = items.reverse();
        console.log('success');

        callback({msg:'ok',items:that.items});
      },
      error:function(err){
        callback({msg:err});
      }
    });
  },
  // 增加一个条目（需要增加的条目数组, 回调函数）
  addItem: function(newItem, callback) {
    var packed, packedEncryped, data = {},
      that = this;
    var now = newItem.id || new Date().getTime();
    packed = newItem.userName + ',' + newItem.passWord + ',' + newItem.other + ',' + newItem.inputId1 + ',' + newItem.inputId2;
    packedEncryped = DES.encrypt(packed, background.key);
    newItem = {
      name: newItem.name,
      host: newItem.host,
      updateTime: new Date().getTime(),
      items: packedEncryped
    };
    data[now] = encodeURIComponent(JSON.stringify(newItem));
    reqwest({
      url: background.getDatabase() + "/data.json",
      // url: "/collect-******/data.json",
      method: 'PATCH',
      data: JSON.stringify(data),
      success: function(resp) {
        that.pullItems(callback);
      },
      error: function(err) {
        callback({msg:err});
      }
    });
  },
  // 删除列表（条目id, 回调函数）
  deleteItem: function(itemId, callback) {
    var that = this;
    reqwest({
      url: background.getDatabase() + "/data/" + itemId + ".json",
      // url: "/collect-******/data/" + itemId + ".json",
      method: 'DELETE',
      success: function(resp) {
        that.pullItems(callback);
      },
      error: function(err) {
        callback({msg:err});
      }
    });
  }

};

// DES函数封装
var DES = {
  encrypt: function(message, key) {
    // des加密解密 js与java版
    // https://gist.github.com/ufologist/5581486
    // https://www.douban.com/note/276592520/
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  },
  decrypt: function(ciphertext, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);

    var decrypted = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
    }, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
};


var reqwesJ = function(url, openType, successCallback, errorCallback) {
  var xmlhttp = null;
  openType = openType || 'GET';
  successCallback = successCallback || function(responseText) {};
  errorCallback = errorCallback || function(errorCode) {};
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  if (xmlhttp !== null) {
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          var responseData = null;
          try {
            responseData = JSON.parse(xmlhttp.responseText);
          } catch (e) {
            errorCallback(99);
            return;
          }
          successCallback(responseData);
        } else {
          errorCallback(xmlhttp.status);
        }
      } else {}
    };
    xmlhttp.open(openType, url, true);
    xmlhttp.send(null);
  } else {
    errorCallback(0);
  }
};

// 对象克隆
var clones = function(obj) {
  var newObj = JSON.stringify(obj);
  newObj = JSON.parse(newObj);
  return newObj;
};
background.pullItems();
