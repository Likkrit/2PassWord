// @see https://github.com/likkrit

document.getElementById('search').addEventListener('input', function () {
  test(document.getElementById('search').value);
});

function test(keyCache) {
  var keyLength = keyCache.length;
  var index, index2;
  var indexWord = indexWord2 = '';
  var c = [];
  window.c = window.c || [];
  //遍历索引，执行查找
  for (var i = 0; i < window.c.length; i++) {
    index = window.c[i]['name_py'].toUpperCase().indexOf(keyCache.toUpperCase());
    index2 = window.c[i]['userName_py'].toUpperCase().indexOf(keyCache.toUpperCase());
    if (index >= 0 || index2 >= 0) {

      //区分多音字
      if (window.c[i]['name_py'].length > window.c[i]['name'].length) {
        var dyzArr = window.c[i]['name_py'].split(',');
        if (dyzArr.length > 1) {
          for (var j = 0; j < dyzArr.length; j++) {
            if (dyzArr[j].toUpperCase().indexOf(keyCache.toUpperCase()) >= 0) {
              index = dyzArr[j].toUpperCase().indexOf(keyCache.toUpperCase());
              break;
            }
          }
        }
      }
      indexWord = window.c[i]['name'].substr(index, keyLength);
      indexWord2 = window.c[i]['userName'].substr(index2, keyLength);
      if (index < 0) {
        hightLightName = window.c[i].name;
      } else {
        hightLightName = window.c[i].name.replace(new RegExp(indexWord, 'i'), '<i>' + indexWord + '</i>') || window.c[i].name;
      }
      if (index2 < 0) {
        hightLightUserName = window.c[i].userName;
      } else {
        hightLightUserName = window.c[i].userName.replace(new RegExp(indexWord2, 'i'), '<i>' + indexWord2 + '</i>') || window.c[i].userName;
      }
      c.push({
        id: window.c[i].id,
        name: hightLightName,
        name_py: window.c[i].name_py,
        userName: hightLightUserName,
        userName_py: window.c[i].userName_pyname_py,
        available: window.c[i].available
      });
    }
  }
  contentPopup.render(c);
}

var contentPopup = {
  // 从background获取item 只有成功没有失败
  getItem: function (id, callback) {
    var port = chrome.runtime.connect({
      name: "getItem"
    });
    port.postMessage({
      id: id
    });
    port.onMessage.addListener(function (result) {
      callback(result);
    });
  },
  // 从background获取items 只有成功没有失败
  getItems: function (url) {
    var port = chrome.runtime.connect({
      name: "getItems"
    });
    port.postMessage({
      url: url
    });
    var that = this;
    port.onMessage.addListener(function (result) {
      // 渲染列表
      window.c = that.py(result.items);
      window.z = result.items;
      that.render(window.c);
    });
  },
  closeContentPopup: function () {
    window.close();
  },
  // 插入contentScript 只有成功没有失败
  insertContentScript: function (id) {
    chrome.runtime.sendMessage({
      type: "insertContentScript",
      id: id
    });
    window.close();
  },
  py: function (items) {
    var c = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].name != "" && items[i].userName != "") {
        //获取拼音首字母缩写
        //将拼音与中文的对应关系添加到数组中
        c.push({
          id: items[i].id,
          name: items[i].name,
          name_py: makePy(items[i].name).toString(),
          userName: items[i].userName,
          userName_py: makePy(items[i].userName).toString(),
          available: items[i].available || false
        });
      }
    }
    return c;
  },
  // 显示列表
  render: function (response) {
    var oriItemStr = document.getElementById('popupcontainer').innerHTML;
    var itemStr = '';
    response = response || [];
    for (var i = 0; i < response.length; i++) {
      itemStr += '<li class="cellrow ';
      if (response[i].available)
        itemStr += 'active';
      itemStr += '" aid=' + response[i].id + '>';
      itemStr += '<div class="cellimg"></div>';
      itemStr += '<div class="cellstr"><p class="cellname">';
      itemStr += response[i].name;
      itemStr += '</p>';
      itemStr += '<p class="cellinfo">';
      itemStr += response[i].userName || '-----';
      itemStr += '</p>';
      itemStr += '</div><div class="cellconfig"></div></li>';
    }
    //为空时显示empty页面
    if (response.length === 0) {
      itemStr += '<div style="display: flex;justify-content: center;align-items: center;height: 246px;"><p>空空如也</p></div>'
      document.getElementById('popupcontainer').innerHTML = itemStr;
      // 原来的列表页与将要渲染的不一样时 才进行渲染
    } else if (oriItemStr != itemStr) {
      document.getElementById('popupcontainer').innerHTML = itemStr;
    }
  }
};

function eventFire() {

  document.oncontextmenu = function (e) {
    // 右键点击tr
    if (e.target.tagName == 'LI' || e.target.parentNode.tagName == 'LI' || e.target.parentNode.parentNode.tagName == 'LI') {
      var aid = getAid(e);
      if (!aid) return;
      document.getElementById('headerdiv').style.display = 'none';
      document.getElementById('headerback').style.display = 'block';
      document.getElementById('moreDiv').setAttribute('aid', aid);
      document.getElementById('moreDiv').style.display = 'block';
      document.getElementById('popupcontainer').style.display = 'none';
      e.preventDefault();
    }
    
  };

  document.addEventListener('click', function (e) {
    // 动作 点击关闭
    if (e.target.attributes['action'] && e.target.attributes['action'].value == 'closemore') {
      document.getElementById('moreDiv').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'block';
    document.getElementById('headerdiv').style.display = 'block';
      document.getElementById('headerback').style.display = 'none';

      // 点击 返回idid
    } else if (e.target.id == 'headerback' || e.target.parentNode.id == 'headerback') {
      document.getElementById('moreDiv').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'block';
    document.getElementById('headerdiv').style.display = 'block';
      document.getElementById('headerback').style.display = 'none';
      e.preventDefault();
      //动作 点击编辑
    } else if (e.target.attributes['action'] && e.target.attributes['action'].value == 'edit') {
      localStorage.tpw_tabDialogId = document.getElementById('moreDiv').attributes['aid'].value;
      contentPopup.closeContentPopup();
      chrome.runtime.sendMessage({
        type: "openTabDialog"
      });
    }
    //动作 点击自动插入
    else if (e.target.attributes['action'] && e.target.attributes['action'].value == 'autocomplete') {
      var aid = document.getElementById('moreDiv').attributes['aid'].value;
      if (!aid) return;
      contentPopup.insertContentScript(aid);
      // 复制 用户名、密码、地址
    } else if (e.target.attributes['action'] && (e.target.attributes['action'].value == 'copypassword' ||
        e.target.attributes['action'].value == 'copyusername' ||
        e.target.attributes['action'].value == 'copyurl')) {
      var aid = document.getElementById('moreDiv').attributes['aid'].value;
      contentPopup.getItem(aid, function (result) {
        if (result.msg == 'ok') {
          var copyInput = document.createElement('input');
          if (e.target.attributes['action'].value == 'copyurl')
            copyInput.value = result.item.host;
          else if (e.target.attributes['action'].value == 'copyusername')
            copyInput.value = result.item.userName;
          else if (e.target.attributes['action'].value == 'copypassword')
            copyInput.value = result.item.passWord;
          copyInput.style.opacity = '0';
          copyInput.id = 'copyInput';
          document.body.appendChild(copyInput);
          document.getElementById("copyInput").select();
          document.execCommand("Copy");
          document.body.removeChild(document.getElementById("copyInput"));
          contentPopup.closeContentPopup();
        }
      })
    } else if (e.target.className == 'cellconfig') {
      var aid = getAid(e);
      if (!aid) return;
      document.getElementById('headerdiv').style.display = 'none';
      document.getElementById('headerback').style.display = 'block';
      document.getElementById('moreDiv').setAttribute('aid', aid);
      document.getElementById('moreDiv').style.display = 'block';
      document.getElementById('popupcontainer').style.display = 'none';
      // 点击tr
    } else if (e.target.tagName == 'LI' || e.target.parentNode.tagName == 'LI' || e.target.parentNode.parentNode.tagName == 'LI') {
      var aid = getAid(e);
      if (!aid) return;
      contentPopup.insertContentScript(aid);
    }
  });

}

function init() {
  // 检测是否已经设置数据库地址和密码
  document.body.style.opacity = 1;

  // 如果具有这些方法
  if (chrome && chrome.runtime) {
    try {
      chrome.runtime.sendMessage({
        type: "getStatus"
      }, function (response) {
        if (response.msg == 'noSetting') {
          chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.create({
              index: tab.index + 1,
              url: "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/optionsE.html"
            }, function (tab) {});
          });
        }
      });

      chrome.tabs.getSelected(function (tab) {
        contentPopup.getItems(tab.url || "");
        setTimeout(function () {
          document.getElementById('search').focus();
        }, 10);
      });
    } catch (e) {}
  }
  eventFire();
}


function getAid(e) {
  var aid = e.target.attributes['aid'] ||
    e.target.parentNode.attributes['aid'] ||
    e.target.parentNode.parentNode.attributes['aid'] ||
    e.target.parentNode.parentNode.parentNode.attributes['aid'];
  aid = aid ? aid.value : null;
  console.log(aid);
  return aid;
}

init();