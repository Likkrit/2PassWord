function contentIcons() {
  // 创建style
  var styleNode = document.createElement("style");
  styleNode.setAttribute("type", "text/css");
  var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4T2NkoBAwIukXALL9gViBgJkPgPIbgfgDSB2yAQVAfj+RDioEqpuAbkADUKAeiB0JGLIfKN8IxCD1KC6AGYDsqgtANf+B2BDJUBCfaAM2QDUGkGMAcpjA/Qx1EVEugHkJZDlcA7EGgKJSHi0wHwL5D4g1wAGoEISRwQEgB4SJCkSQZns0Aw6SYgDICyCMDEDOJ8oL6E5HMwfsDayxQHFSBmUmUIJBdzq6C0DeWAATRE626AqJ4gMAKh82EQu8MAEAAAAASUVORK5CYII=';
  var icon1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAAXNSR0IArs4c6QAAAPhJREFUOBHlU70KgzAQPlMhEvoQTg6OPoOjT+JWOnRqkUKHgqWP4OQbOPokTk6OTkVULNSLVc62oJmbIdzd95NcuGjX2/3YVI/Ts+t0WLE2ut5xsQ0O+90F6UxFjAI8qNcEGONia08e6MNONYwCS7EQAizLmtG' +
    'UDEzTBNd1fxsYhjEBnHPQNG3KKTYV34F8ec/zwHEciOMYyrIE3/ehKAqIoggo9inGXKmFXwbyBkmSQJqmUNe15IRhCG3byphitm1/eUzDM4qR0TTNjEixGdAnSi3keS5vSk2UDKqqgizLqB4YzvassiKhGtZ/jDMtLOnHz7TE+yf8BaDZXA509yeBAAAAAElFTkSuQmCC';
  styleNode.appendChild(document.createTextNode('[class*="tpw_icon"]{background-image: url("' + icon + '")!important;background-position: 98% 50%!important;background-repeat: no-repeat!important;}'));
  document.body.appendChild(styleNode);
  this.inputsNum = 0;
  this.iframesNum = 0;
  this.domNodeFind();
  var that = this;
  // 事件绑定
  document.addEventListener('mousemove', function(e) {
    if (!that.inputCheck(e.target)) return;
    if (that.mouseOnIcon(e)) {
      e.target.style.cursor = 'pointer';
    } else {
      e.target.style.cursor = 'auto';
    }
  });
  document.addEventListener('click', function(e) {
    if (!that.inputCheck(e.target)) return;
    if (that.mouseOnIcon(e)) {
      that.iconClick(e);
    }
  });
  document.addEventListener('DOMNodeInserted', function() {
    that.domNodeFind();
  }, false);

}
contentIcons.prototype.domNodeFind = function() {
    var iframes = document.getElementsByTagName('iframe');
    if (this.iframesNum != iframes.length) {
      var lengthOffset = 0;
      for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].className == 'tpw_iframe')
          lengthOffset = -1;
      }
      if (iframes.length + lengthOffset != this.iframesNum) {
        console.log('插入一次脚本');
        this.iframesNum = iframes.length;
        chrome.runtime.sendMessage({
          type: "insertContentIconsScript",
          allFrames: true
        });
      }
    }
    iframes = [];
    var inputs = document.getElementsByTagName('input');
    if (this.inputsNum != inputs.length) {
      for (i = 0; i < inputs.length; i++) {
        if (inputs[i].className.indexOf('tpw_icon') <= 0 && this.inputCheck(inputs[i])) {
          inputs[i].className = inputs[i].className + ' tpw_icon';
          console.log('加入了一个图标');
        }
      }
      this.inputsNum = inputs.length;
    }
    inputs = [];
  }
  // 输入框类型检测
contentIcons.prototype.inputCheck = function(ele) {
    if (ele.nodeName == 'INPUT' && ele.attributes["type"])
      if (ele.attributes["type"].value == 'text' || ele.attributes["type"].value == 'password' || ele.attributes["type"].value == 'email')
        return true;
    return false;
  }
  // 鼠标是否在input的图标上
contentIcons.prototype.mouseOnIcon = function(e) {
    var borderWidth = parseInt(getComputedStyle(e.target, null).borderWidth);
    var left = ((e.target.offsetWidth - borderWidth * 2) - 16) * 0.98;
    var right = ((e.target.offsetWidth - borderWidth * 2) - 16) * 0.98 + 16;
    var top = ((e.target.offsetHeight - borderWidth * 2) - 18) * 0.5;
    var bottom = ((e.target.offsetHeight - borderWidth * 2) - 18) * 0.5 + 18;
    if (e.offsetX > left && e.offsetX <= right && e.offsetY > top && e.offsetY <= bottom)
      return true;
    else
      return false
  }
  // 获取位于input元素98% 50%位置的绝对坐标
contentIcons.prototype.offset = function(ele) {
  if (!ele) return;
  var oldEle = ele;
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
  left = (left + oldEle.offsetWidth - 16 - (0.3 * 16));
  top = (top + (oldEle.offsetHeight - 18) / 2);
  return {
    left: left,
    top: top
  }
}

// 点击事件
contentIcons.prototype.iconClick = function(e) {
  var offset = {
    left: 0,
    top: 0
  };
  offset = this.offset(e.target);
  offset.top += 21;
  chrome.runtime.sendMessage({
    type: "openContentPopup",
    offset: offset,
    mousePoint: {
      x: e.x,
      y: e.y
    },
    iframe: top != self ? true : false
  });
};
var icons = icons ? icons : new contentIcons();
