(function() {
  // -----------------------------------信息传递函数
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (sender.tab) {
      if (request.type == "getInput") {
        localStorage.pageInput1 = request.input1;
        localStorage.pageInput2 = request.input2;
        sendResponse({
          msg: 'ok'
        });
      }
    }
    if (request.type == "insertContentScript" && request.id) {
      var item = null;
      for (var i = 0; i < z.items.length; i++) {
        if (z.items[i].id == request.id) {
          item = JSON.stringify(background.getItem(request.id));
        }
      }
      var code = "window.item='" + item + "';item=JSON.parse(item);";
      chrome.tabs.executeScript(null, {
        code: code,
        allFrames: true
      });
      chrome.tabs.executeScript(null, {
        file: "./js/content_script.js",
        allFrames: true
      });
    }
    // unlock
    else if (request.type == "unLock") {
      background.unLock(request.lockKey);
      sendResponse({
        msg: 'ok'
      });
    }
    else if (request.type == "resetLockKey") {
      background.resetLockKey(request.lockKey);
      sendResponse({
        msg: 'ok'
      });
    }
    // popup 获取当前状态
    else if (request.type == "getStatus") {
      sendResponse({
        msg: z.status,
        locked : (!background.lockKey && localStorage.h5lock_password)
        //已上锁 （没有lockKey 且 有password）
      });
    }
  });

  var connecting;
  // 消息传递通道
  chrome.runtime.onConnect.addListener(function(port) {
    connecting = true;
    switch (port.name) {
      case "getItem":
        port.onMessage.addListener(function(request) {
          var item = background.getItem(request.id);
          if (connecting) {
            port.postMessage({
              msg: "ok",
              item: item
            });
          }
        });
        break;
      case "getItems":
        port.onMessage.addListener(function(request) {
          background.getItems(request.url, function(result) {
            if (connecting) {
              port.postMessage({
                msg: "ok",
                items: result.items
              });
            }
          });
        });
        break;
      case "addItem":
        port.onMessage.addListener(function(request) {
          background.addItem(request.newItem, function(result) {
            if (connecting) {
              port.postMessage(result);
            }
          });
        });
        break;
      case "deleteItem":
        port.onMessage.addListener(function(request) {
          background.deleteItem(request.id, function(result) {
            if (connecting) {
              port.postMessage(result);
            }
          });
        });
        break;
      case "pullItems":
        port.onMessage.addListener(function(request) {
          background.pullItems(function(result) {
            if (connecting)
              port.postMessage(result);
          });
        });
        break;
      case "sendKey":
        port.onMessage.addListener(function(request) {
          if (request.key)
            background.setKey(request.key);
          background.pullItems(function(result) {
            if (connecting)
              port.postMessage(result);
          });
        });
        break;
      default:
        break;
    }
    port.onDisconnect.addListener(function(port) {
      connecting = false;
    });
  });
  // -----------------------------------信息传递函数
  var z = {
    items: []
  };
  var background = {
    lockKey: '',
    // 程序初始化，判断程序当前状态
    init: function() {
      if (localStorage.url && localStorage.privateKey) {
        z.status = 'loading';
        // 如果当前数组为空，则进行拉取操作，否则状态设置为已经就绪
        z.items.length == 0 ? this.pullItems() : z.status = 'loaded';
      } else if (!localStorage.url) {
        z.status = 'noUrl';
      } else if (!localStorage.privateKey) {
        z.status = 'noKey';
      }
    },
    notAccess: function() {
      return !(localStorage.privateKey && localStorage.url);
    },
    // 通过锁屏密码来获取自定义密码，锁屏密码错误将返回
    getKey: function() {
      return AES.decrypt(localStorage.privateKey || '', this.lockKey);
    },
    // 使用lockKey将自定义密码加密后储存在localStorage中
    setKey: function(key, lockKey) {
      lockKey = lockKey || this.lockKey;
      localStorage.privateKey = AES.encrypt(key, lockKey);
    },
    // 重新设置锁屏密码，并重新加密自定义密码，需要this.lockKey已经正确的情况下，否则会清空自定义密码
    resetLockKey: function(newLockKey) {
      localStorage.privateKey = AES.encrypt(this.getKey(), newLockKey);
      this.lockKey = newLockKey;
    },
    // 输入了密码进行解锁操作，这里不判断锁屏密码是否正确，密码不正确将解密不了字段，但是不影响正常进入
    unLock: function(lockKey) {
      this.lockKey = lockKey;
    },
    // 获取数据库的路径
    getDatabase: function() {
      // var path = CryptoJS.MD5(this.getKey()).toString().toUpperCase();
      // return 'http://' + localStorage.url + '/2password-' + path.slice(path.length - 6);
      return 'http://' + localStorage.url;
    },
    // 获取指定id 的对象
    getItem: function(id) {
      for (var i = 0; i < z.items.length; i++) {
        if (id == z.items[i].id) {
          var item = this.decode(z.items[i].z);
          item.id = z.items[i].id;
          item.name = z.items[i].name || '';
          item.host = z.items[i].host || '';
          item.updateTime = z.items[i].updateTime || '';
          return item;
        }
      }
      return {};
    },
    // 解密字段
    decode: function(z) {
      var decodeStr = AES.decrypt(z, this.getKey()) || '';
      decodeStr = decodeStr.split(',');
      return {
        "userName": decodeStr[0] || '',
        "passWord": decodeStr[1] || '',
        "other": decodeStr[2] || '',
        "inputId1": decodeStr[3] || '',
        "inputId2": decodeStr[4] || '',
      };
    },
    // 获取指定tab url的账户列表，列表根据url排序过
    getItems: function(url, callback) {
      var items = [];
      if (url) {
        var activeItem;
        var newItems = this.clones(z.items);
        for (var i = 0; i < newItems.length; i++) {
          if (url.indexOf(newItems[i].name) > 0 || url.indexOf(newItems[i].host) > 0) {
            activeItem = this.decode(newItems[i].z);
            activeItem.id = newItems[i].id;
            activeItem.name = newItems[i].name || '';
            activeItem.host = newItems[i].host || '';
            activeItem.updateTime = newItems[i].updateTime || '';
            activeItem.available = true;
            items.push(activeItem);
            newItems.splice(i, 1);
          }
        }
        for (i = 0; i < newItems.length; i++) {
          items.push(newItems[i]);
        }
      }
      callback({
        msg: 'ok',
        items: (items.length === 0) ? z.items : items
      });
    },
    // 以下函数当遇到错误时返回错误信息
    // 从服务器刷新列表
    pullItems: function(callback) {
      var that = this;
      callback = callback || function() {};
      this.notAccess() ? callback({
        msg: 'not Access'
      }) : reqwest({
        url: background.getDatabase() + "/.json",
        // url: "/collect-******/data.json?" + new Date().getTime(),
        method: 'GET',
        success: function(response) {
          response = response && response.data ? response.data : [];
          var i, temp, decrypted, name, host, updateTime, userName, passWord, other, inputId1, inputId2, newItem,
            items = [];
          for (i in response) {
            response[i].id = i;
            items.push(response[i]);
          }
          z.items = items.reverse();
          z.status = 'loaded';
          console.log('success');
          callback({
            msg: 'ok',
            items: z.items
          });
        },
        error: function(err) {
          z.status = 'network error';
          callback({
            msg: err
          });
        }
      });
    },
    // 增加一个条目（需要增加的条目数组, 回调函数）
    addItem: function(newItem, callback) {
      var packed, packedEncryped, data = {},
        that = this,
        id = newItem.id || new Date().getTime();
      packed = newItem.userName + ',' + newItem.passWord + ',' + newItem.other + ',' + newItem.inputId1 + ',' + newItem.inputId2;
      packedEncryped = AES.encrypt(packed, this.getKey());
      var _data_name = "data/" + id + "/name";
      var _data_host = "data/" + id + "/host";
      var _data_updateTime = "data/" + id + "/updateTime";
      var _data_z = "data/" + id + "/z";
      data[_data_name] = newItem.name;
      data[_data_host] = newItem.host;
      data[_data_updateTime] = new Date().getTime();
      data[_data_z] = packedEncryped;
      this.notAccess() ? callback({
        msg: 'not Access'
      }) : reqwest({
        url: background.getDatabase() + "/.json",
        // url: "/collect-******/data.json",
        method: 'PATCH',
        data: JSON.stringify(data),
        success: function(resp) {
          // 增加一个item 成功后重新拉取数据 传入回调函数
          that.pullItems(callback);
        },
        error: function(err) {
          callback({
            msg: err
          });
        }
      });
    },
    // 删除列表（条目id, 回调函数）
    deleteItem: function(id, callback) {
      var that = this;
      this.notAccess() ? callback({
        msg: 'not Access'
      }) : reqwest({
        url: background.getDatabase() + "/data/" + id + ".json",
        // url: "/collect-******/data/" + itemId + ".json",
        method: 'DELETE',
        success: function(resp) {
          // 删除一个item 成功后重新拉取数据 传入回调函数
          that.pullItems(callback);
        },
        error: function(err) {
          callback({
            msg: err
          });
        }
      });
    },
    // 对象克隆
    clones: function(obj) {
      var newObj = JSON.stringify(obj);
      newObj = JSON.parse(newObj);
      return newObj;
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

  // AES函数封装
  var AES = {
    encrypt: function(message, key) {
      // aes加密解密 js与java版
      // http://www.jb51.net/article/89647.htm
      // http://stackoverflow.com/questions/16600509/aes-encrypt-in-cryptojs-and-decrypt-in-coldfusion
      // http://www.cnblogs.com/liyingying/p/6259756.html
      keyHex = CryptoJS.MD5(key).toString().slice(0, 16);
      var iv = CryptoJS.MD5(key).toString().slice(16);
      keyHex = CryptoJS.enc.Utf8.parse(keyHex);
      iv = CryptoJS.enc.Utf8.parse(iv);
      var encrypted = CryptoJS.AES.encrypt(message, keyHex, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return encrypted.toString();
    },
    decrypt: function(message, key) {
      keyHex = CryptoJS.MD5(key).toString().slice(0, 16);
      var iv = CryptoJS.MD5(key).toString().slice(16);
      keyHex = CryptoJS.enc.Utf8.parse(keyHex);
      iv = CryptoJS.enc.Utf8.parse(iv);
      var decrypted = CryptoJS.AES.decrypt(message, keyHex, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
  };
  // 当一个标签加载完成时，此事件触发
  // 用于显示当前浏览标签是否有记录下的用户名密码
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status != "loading") {
      return false;
    }
    var url = tab.url || "";
    if (!z.items)
      return;
    for (var i = 0; i < z.items.length; i++) {
      if (z.items[i].name && url.indexOf(z.items[i].name) > 0 || url.indexOf(z.items[i].host) > 0) {
        chrome.browserAction.setIcon({
          path: "images/page_64.png",
          tabId: tabId
        });
        return;
      }
    }
  });
  window.z = z;
  background.init();
})();
