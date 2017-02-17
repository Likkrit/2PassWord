var selectNode = document.body;
var newNode;
var tpw_offset = window.tpw_offset || {
  top: 0,
  left: '50%'
};
if (document.querySelector('.tpw_iframe')) {
  try {
    document.body.removeChild(document.querySelector('.tpw_iframe'));
  } catch (e) {}
} else {
  if (window.tpw_iframe) {
    var allIframe = document.getElementsByTagName("iframe");
    for (var i = 0; i < allIframe.length; i++) {
      if (allIframe[i].offsetWidth >= 100 && allIframe[i].className != 'tpw_iframe') {
        var frameOffset = allIframe[i].getBoundingClientRect();
        tpw_offset.left += frameOffset.left;
        tpw_offset.top += frameOffset.top + window.document.body.scrollTop;
      }
    }
  }
  // 超出可视区偏移
  if ((tpw_mousePoint.x + 165) > document.body.offsetWidth) {
    tpw_offset.left = tpw_offset.left - ((tpw_mousePoint.x + 165 + 8) - document.body.offsetWidth);
  }
  else if ((tpw_mousePoint.x - 165) < 0) {
    tpw_offset.left = tpw_offset.left + (165 + 8 - tpw_mousePoint.x);
  }
  // 创建iframe元素插入
  newNode = document.createElement("iframe");
  newNode.className = 'tpw_iframe';
  newNode.src = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/contentPopup.html?" + location.href;
  newNode.width = '330';
  newNode.height = '314';
  newNode.style.top = tpw_offset.top + 'px';
  newNode.style.left = tpw_offset.left + 'px';
  newNode.style.transform = 'translate(-50%,0)';
  newNode.style.position = "absolute";
  newNode.style.border = "none";
  newNode.style.zIndex = 999999;
  document.body.appendChild(newNode);
}
