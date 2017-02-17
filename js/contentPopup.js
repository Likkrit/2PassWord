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
function eventFire(){
  document.querySelector('#SB_closeico_img').addEventListener('click',function(){
    chrome.runtime.sendMessage({
      type: "closeContentPopup"
    });
  });
}
function init() {
  // 如果具有这些方法
  if (chrome && chrome.runtime) {
    contentPopup.getItems(location.href);
  }
  eventFire();
}


init();
