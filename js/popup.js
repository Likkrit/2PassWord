// @see https://github.com/likkrit

function getAid(e) {
  var aid = e.target.attributes['aid'] ||
    e.target.parentNode.attributes['aid'] ||
    e.target.parentNode.parentNode.attributes['aid'] ||
    e.target.parentNode.parentNode.parentNode.attributes['aid'];
  aid = aid ? aid.value : null;
  return aid;
}

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
    chrome.runtime.sendMessage({
      type: "closeContentPopup"
    });
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
      itemStr += '<div class="empty"><p>空空如也</p></div>'
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
      chrome.runtime.sendMessage({
        type: "openTabDialog"
      });
      contentPopup.closeContentPopup();
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
      if(!window.content){
        contentPopup.insertContentScript(aid);
      }else if(/active/i.test(e.target.className) || /active/i.test(e.target.parentNode.className) || /active/i.test(e.target.parentNode.parentNode.className)){
        contentPopup.insertContentScript(aid);
      }
    } else if (window.content) {
      contentPopupEvent(e);
    }
  });
}


function init() {
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

function contentPopupEvent(e) {
  // 点击 眼睛
  if (e.target.id == 'passwordIcon') {
    if (e.target.className.indexOf('selected') >= 0) {
      e.target.className = e.target.className.replace(/selected/, '');
      document.getElementById('p').type = 'password';
    } else {
      e.target.className += ' selected';
      document.getElementById('p').type = 'text';
    }
    // 点击 关闭窗口
  } else if (e.target.id == 'SB_closeico_img') {
    contentPopup.closeContentPopup();
  }
  // 点击 取消
  else if (e.target.id == 'savecancel') {
    contentPopup.closeContentPopup();
  }
  // 点击 确定
  else if (e.target.id == 'savesubmit') {
    var newItem = {
      id: new Date().getTime(),
      name: document.getElementById('name').value || '',
      userName: document.getElementById('u').value || '',
      passWord: document.getElementById('p').value || '',
      other: '',
      host: document.getElementById('url').innerHTML,
      identify: document.getElementById('identify').innerHTML,
      inputId1: document.getElementById('label-input1').innerText || '',
      inputId2: document.getElementById('label-input2').innerText || '',
    };
    document.getElementById('savesubmit').innerText = '保存中';
    var port = chrome.runtime.connect({
      name: "addItem"
    });
    port.postMessage({
      newItem: newItem
    });
    port.onMessage.addListener(function (result) {
      if (result.msg == 'ok') {
        contentPopup.closeContentPopup();
      } else {
        document.getElementById('savesubmit').innerText = result.msg;
      }
    });
  }
  // 点击tab
  else if (e.target.tagName == 'INPUT' && e.target.id.search(/SB_.+_img/) >= 0) {
    document.querySelector('input[class*=active]').className = document.querySelector('input[class*=active]').className.replace(/active/, 'img');
    e.target.className = e.target.className.replace(/img/, 'active');
    document.getElementById('moreDiv').style.display = 'none';
    if (e.target.id == 'SB_siteico_img') {
      document.getElementById('headerdiv').style.display = 'block';
      document.getElementById('popupcontainer').style.display = 'block';
      document.getElementById('lptabpopupsave').style.display = 'none';
    } else if (e.target.id == 'SB_addico_img') {
      document.getElementById('headerdiv').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'none';
      document.getElementById('lptabpopupsave').style.display = 'block';
    }
  }
}

function contentPopupInit() {
  document.body.style.opacity = 1;
  window.content = true;
  // 如果具有这些方法
  if (chrome && chrome.runtime) {
    contentPopup.getItems(location.href);
  }
  var saveForms;
  saveForms = localStorage.tpw_saveForms ? JSON.parse(localStorage.tpw_saveForms) : {};
  if (saveForms.length > 0 && saveForms.length == 2) {
    document.getElementById('u').value = saveForms[0].value;
    document.getElementById('p').value = saveForms[1].value;
    document.getElementById('u').style.background = 'rgba(0,255,0,0.1)';
    document.getElementById('p').style.background = 'rgba(0,255,0,0.1)';
    document.getElementById('label-input1').innerHTML = '[name="' + saveForms[0].name + '"]';
    document.getElementById('label-input2').innerHTML = '[name="' + saveForms[1].name + '"]';
  } else if (saveForms.length < 2 || !saveForms.length) {

  } else { // > 2
    // 清除字段为空的
    var result = saveFormsRecognize(saveForms);
    console.log(result);
    if (result[0].type && result[1].type) {
      document.getElementById('u').value = result[0].value;
      document.getElementById('p').value = result[1].value;
      document.getElementById('u').style.background = 'rgba(0,255,0,0.1)';
      document.getElementById('p').style.background = 'rgba(0,255,0,0.1)';
      document.getElementById('label-input1').innerHTML = '[name="' + result[0].name + '"]';
      document.getElementById('label-input2').innerHTML = '[name="' + result[1].name + '"]';
    } else if (result[0].type) {
      document.getElementById('u').value = result[0].value;
      document.getElementById('u').style.background = 'rgba(0,255,0,0.1)';
      document.getElementById('p').style.background = 'rgba(255,0,0,0.1)';
      document.getElementById('label-input1').innerHTML = '[name="' + result[0].name + '"]';
    } else if (result[1].type) {
      document.getElementById('p').value = result[1].value;
      document.getElementById('u').style.background = 'rgba(255,0,0,0.1)';
      document.getElementById('p').style.background = 'rgba(0,255,0,0.1)';
      document.getElementById('label-input2').innerHTML = '[name="' + result[1].name + '"]';
    } else {
      document.getElementById('p').style.background = 'rgba(255,0,0,0.1)';
      document.getElementById('u').style.background = 'rgba(255,0,0,0.1)';
    }

  }

  var identify = location.href.split('?')[1] ? location.href.split('?')[1].match(/https?:\/\/[\w\.\-\_]+/) : '';
  identify = identify ? identify[0].replace(/https?:\/\//ig, '') : '';
  document.getElementById('identify').innerHTML = identify;
  document.getElementById('url').innerHTML = location.href.split('?')[1] ? location.href.split('?')[1] : '';
  setTimeout(function () {
    document.getElementById('search').focus();
  }, 10);
  eventFire();
}


// 字段大于3个的时候进行识别
function saveFormsRecognize(saveForms) {
  var result = [{}, {}];
  var saveForms = saveForms.concat();
  // 确定密码
  for (var i = 0; i < saveForms.length; i++) {
    if (saveForms[i].type == 'password' && saveForms[i].name) {
      result[1] = JSON.parse(JSON.stringify(saveForms[i]));
      saveForms.splice(i, 1);
      break;
    }
  }
  // 删除验证码
  for (var i = 0; i < saveForms.length; i++) {
    saveForms[i].name = saveForms[i].name.toLowerCase();
    if (saveForms[i].name.indexOf('code') >= 0 ||
      saveForms[i].name == 'c') {
      saveForms.splice(i, 1);
      if (saveForms.length == 1) {
        result[0] = JSON.parse(JSON.stringify(saveForms[0]));
      }
      break;
    }
  }
  // 获得用户名
  for (var i = 0; i < saveForms.length; i++) {
    saveForms[i].name = saveForms[i].name.toLowerCase();
    if (saveForms[i].name.indexOf('user') >= 0 ||
      saveForms[i].name.indexOf('usr') >= 0 ||
      saveForms[i].name.indexOf('mail') >= 0 ||
      saveForms[i].name == 'u') {
      result[0] = JSON.parse(JSON.stringify(saveForms[i]));
      break;
    }
  }
  return result;
}

if (location.href.match(/\/popup.html/)) {
  init();
} else {
  contentPopupInit();
}