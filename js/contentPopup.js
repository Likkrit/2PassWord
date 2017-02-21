// @see https://github.com/likkrit

var contentPopup = {
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
    var that = this;
    port.onMessage.addListener(function(result) {
      // 渲染列表
      that.render(result.items);
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
      itemStr += '<tr class="popuprow" aid=' + response[i].id + '>';
      if (response[i].available)
        itemStr += '<td>';
      else {
        itemStr += '<td>';
      }
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
    if (e.target.attributes['action'] && e.target.attributes['action'].value == 'closemore') {
      document.getElementById('moreDiv').style.display = 'none';
      document.getElementById('lptabpopupsave').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'block';
    } else if (e.target.id == 'savecancel') {
      chrome.runtime.sendMessage({
        type: "closeContentPopup"
      });
    } else if (e.target.id == 'SB_closeico_img') {
      window.close();
      chrome.runtime.sendMessage({
        type: "closeContentPopup"
      });
    } else if (e.target.tagName == 'SPAN' && (e.target.className == 'expander' || e.target.parentNode.className == 'expander')) {
      var aid = getAid(e);
      if (!aid) return;
      document.getElementById('lptabpopupmore').setAttribute('aid', aid);

      document.getElementById('moreDiv').style.display = 'block';
      document.getElementById('lptabpopupsave').style.display = 'none';
      document.getElementById('popupcontainer').style.display = 'none';
    } else if (e.target.tagName == 'TR' || e.target.parentNode.tagName == 'TR' || e.target.parentNode.parentNode.tagName == 'TR') {
      var aid = getAid(e);
      if (!aid) return;
      chrome.runtime.sendMessage({
        type: "insertContentScript",
        id: aid
      });
      window.close();
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
