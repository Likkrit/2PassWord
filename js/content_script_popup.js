var selectNode = document.body;
var newNode;
var tpw_offset = window.tpw_offset || {
  top: 0,
  left: '50%'
};
var tpw_outline_offset = {};
tpw_outline_offset.top = tpw_offset.top;
tpw_outline_offset.left = tpw_offset.left;


if (document.querySelector('.tpw_iframe')) {
  try {
    document.body.removeChild(document.querySelector('.tpw_iframe'));
  } catch (e) {}
}
var frameOffset = {};
frameOffset.left = 0;
if (window.tpw_iframe) {
  var allIframe = document.getElementsByTagName("iframe");
  for (var i = 0; i < allIframe.length; i++) {
    if (allIframe[i].offsetWidth >= 100 && allIframe[i].className != 'tpw_iframe') {
      // frameOffset = allIframe[i].getBoundingClientRect();
      frameOffset = offset(allIframe[i]);
      // tpw_offset.left += frameOffset.left + window.document.body.scrollLeft;
      // tpw_offset.top += frameOffset.top + window.document.body.scrollTop;
      // frameOffset.left = frameOffset.left + window.document.body.scrollLeft;
      tpw_offset.left += frameOffset.left;
      tpw_offset.top += frameOffset.top;
    }
  }
}

// console.log(frameOffset.left); // iframe相对于父级文档0 的坐标
// console.log(tpw_outline_offset.left); // 当前icon相对于父级文档 的坐标
// console.log(document.body.offsetWidth); // 当前视图的大小
// console.log(window.document.body.scrollLeft) // 当前滚动的距离
// console.log(tpw_offset.left) //未调节前 的距离

// 超出可视区偏移
if ((tpw_outline_offset.left + frameOffset.left - window.document.body.scrollLeft) < 165) {
  console.log('距离过小偏移');
  tpw_offset.left = window.document.body.scrollLeft + 165;
}
// 当前点击相对于父级文档左上角 + iframe相对于父级文档0 的坐标
else if ((tpw_outline_offset.left + frameOffset.left + 165) > document.body.offsetWidth + window.document.body.scrollLeft) {
  // 偏移值 = 视图 - 当前点击相对于视图左上角 - 165
  console.log('距离过大偏移');
  var off = (tpw_outline_offset.left + frameOffset.left + 165) - (document.body.offsetWidth + window.document.body.scrollLeft);
  tpw_offset.left = tpw_offset.left - off;
}

// }
// else if ((tpw_mousePoint.x - 165) < 0) {
//   // tpw_offset.left = tpw_offset.left + (165 + 8 - tpw_mousePoint.x);
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


function offset(ele) {
  if (!ele) return;
  var top = ele.offsetTop;
  var left = ele.offsetLeft;
  while (ele.offsetParent) {
    ele = ele.offsetParent;
    if (window.navigator.userAgent.indexOf('MSTE 8') > -1) {
      top += ele.offsetTop;
      left += ele.offsetLeft;
    } else {
      top += ele.offsetTop + ele.clientTop;
      left += ele.offsetLeft + ele.clientLeft;
    }
  }
  return {
    left: left,
    top: top
  }
}