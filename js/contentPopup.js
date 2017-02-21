// @see https://github.com/likkrit

var contentPopup = {
  // 从background获取item 只有成功没有失败
  getItem: function(id, callback) {
    var port = chrome.runtime.connect({
      name: "getItem"
    });
    port.postMessage({
      id: id
    });
    port.onMessage.addListener(function(result) {
      callback(result);
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
    var that = this;
    port.onMessage.addListener(function(result) {
      // 渲染列表
      that.render(result.items);
    });
  },
  closeContentPopup: function() {
    chrome.runtime.sendMessage({
      type: "closeContentPopup"
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
  // 显示列表
  render: function(response) {
    var oriItemStr = document.querySelector('#lptabpopup').innerHTML;
    var itemStr = '<tbody>';
    response = response || [];
    for (var i = 0; i < response.length; i++) {
      itemStr += '<tr class="popuprow ';
      if (response[i].available)
        itemStr += 'available';
      itemStr += '" aid=' + response[i].id + '>';
      itemStr += '<td>';
      itemStr += '<span class="img"></span>';
      itemStr += '<span class="popcell shortenstr">';
      itemStr += response[i].name;
      itemStr += '</span>';
      itemStr += '<span expander="true" class="expander"><span class="img"></span></span>';
      itemStr += '<p class="subtext">';
      itemStr += response[i].userName || '-----';
      itemStr += '</td></tr>';
    }

    //为空时显示empty页面
    if (response.length === 0) {
      itemStr += '<div class="none_tip center"><h3 class="ui grey icon header empty"><i class="sticky note outline icon"></i><span class="dimmer text">Empty List</span></h3></div>'
      document.querySelector('#lptabpopup').innerHTML = itemStr;
      // 原来的列表页与将要渲染的不一样时 才进行渲染
    } else if (oriItemStr != itemStr) {
      document.querySelector('#lptabpopup').innerHTML = itemStr;
    }
  }
};

function eventFire() {

  document.oncontextmenu = function(e) {
    // 右键点击tr
    if (e.target.tagName == 'TR' || e.target.parentNode.tagName == 'TR' || e.target.parentNode.parentNode.tagName == 'TR') {
      var aid = getAid(e);
      if (!aid) return;
      document.getElementById('lptabpopupmore').setAttribute('aid', aid);
      document.getElementById('moreDiv').style.display = 'block';
      document.getElementById('lptabpopupsave').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'none';
    }
    e.preventDefault();
  };

  document.addEventListener('click', function(e) {
    // 动作 点击关闭
    if (e.target.attributes['action'] && e.target.attributes['action'].value == 'closemore') {
      document.getElementById('moreDiv').style.display = 'none';
      document.getElementById('lptabpopupsave').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'block';
      //动作 点击编辑
    } else if (e.target.attributes['action'] && e.target.attributes['action'].value == 'edit') {
      localStorage.tpw_tabDialogId = document.getElementById('lptabpopupmore').attributes['aid'].value;
      contentPopup.closeContentPopup();
      chrome.runtime.sendMessage({
        type: "openTabDialog"
      });
    }
    //动作 点击自动插入
    else if (e.target.attributes['action'] && e.target.attributes['action'].value == 'autocomplete') {
      var aid = document.getElementById('lptabpopupmore').attributes['aid'].value;
      if (!aid) return;
      chrome.runtime.sendMessage({
        type: "insertContentScript",
        id: aid
      });
      // 复制 用户名、密码、地址
    } else if (e.target.attributes['action'] && (e.target.attributes['action'].value == 'copypassword' ||
      e.target.attributes['action'].value == 'copyusername' ||
      e.target.attributes['action'].value == 'copyurl')) {
      var aid = document.getElementById('lptabpopupmore').attributes['aid'].value;
      contentPopup.getItem(aid, function(result) {
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
    }
    // 点击 取消
    else if (e.target.id == 'savecancel') {
      contentPopup.closeContentPopup();
      // 点击 关闭窗口
    } else if (e.target.id == 'SB_closeico_img') {
      contentPopup.closeContentPopup();
      // 点击扳手
    } else if (e.target.tagName == 'SPAN' && (e.target.className == 'expander' || e.target.parentNode.className == 'expander')) {
      var aid = getAid(e);
      if (!aid) return;
      document.getElementById('lptabpopupmore').setAttribute('aid', aid);
      document.getElementById('moreDiv').style.display = 'block';
      document.getElementById('lptabpopupsave').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'none';

      // 点击tr
    } else if (e.target.tagName == 'TR' || e.target.parentNode.tagName == 'TR' || e.target.parentNode.parentNode.tagName == 'TR') {


      if ((e.target.attributes['aid'] || e.target.parentNode.attributes['aid'] || e.target.parentNode.parentNode.attributes['aid'])) {
        var aid = getAid(e);
        if (!aid) return;
        chrome.runtime.sendMessage({
          type: "insertContentScript",
          id: aid
        });
      }
      // 点击tab
    } else if (e.target.tagName == 'INPUT' && e.target.id.search(/SB_.+_img/) >= 0) {
      document.querySelector('input[class*=active]').className = document.querySelector('input[class*=active]').className.replace(/active/, 'img');
      e.target.className = e.target.className.replace(/img/, 'active');
      document.getElementById('moreDiv').style.display = 'none';
      if (e.target.id == 'SB_siteico_img') {
        document.getElementById('popupcontainer').style.display = 'block';
        document.getElementById('lptabpopupsave').style.display = 'none';
      } else if (e.target.id == 'SB_addico_img') {
        document.getElementById('popupcontainer').style.display = 'none';
        document.getElementById('lptabpopupsave').style.display = 'block';
      }
    }
  });

}

function init() {
  // 如果具有这些方法
  if (chrome && chrome.runtime) {
    contentPopup.getItems(location.href);
  }
  var saveForms;
  saveForms = localStorage.tpw_saveForms ? JSON.parse(localStorage.tpw_saveForms) : {};
  console.log(saveForms);
  if (saveForms.length > 0 && saveForms.length == 2) {
    document.getElementById('u').value = saveForms[0].value;
    document.getElementById('p').value = saveForms[1].value;
    document.getElementById('u').style.background = 'rgba(0,255,0,0.1)';
    document.getElementById('p').style.background = 'rgba(0,255,0,0.1)';
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
    } else if (result[0].type) {
      document.getElementById('u').value = result[0].value;
      document.getElementById('u').style.background = 'rgba(0,255,0,0.1)';
      document.getElementById('p').style.background = 'rgba(255,0,0,0.1)';
    } else if (result[1].type) {
      document.getElementById('p').value = result[1].value;
      document.getElementById('u').style.background = 'rgba(255,0,0,0.1)';
      document.getElementById('p').style.background = 'rgba(0,255,0,0.1)';
    } else {
      document.getElementById('p').style.background = 'rgba(255,0,0,0.1)';
      document.getElementById('u').style.background = 'rgba(255,0,0,0.1)';
    }

  }
  eventFire();
}

// 字段大于3个的时候进行识别
function saveFormsRecognize(saveForms) {
  var result = [{}, {}];
  var saveForms = saveForms.concat();
  // 确定密码
  for (var i = 0; i < saveForms.length; i++) {
    if (saveForms[i].type == 'password') {
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

function getAid(e) {
  var aid = e.target.attributes['aid'] ||
    e.target.parentNode.attributes['aid'] ||
    e.target.parentNode.parentNode.attributes['aid'] ||
    e.target.parentNode.parentNode.parentNode.attributes['aid'];
  aid = aid ? aid.value : null;
  return aid;
}

init();
