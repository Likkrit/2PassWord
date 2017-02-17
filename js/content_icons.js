function contentIcons() {
  this.icons = [];

  // 创建icons style节点
  var styleNode = document.createElement("style");
  styleNode.setAttribute("type", "text/css");
  styleNode.appendChild(document.createTextNode('[data-class*="tpw_icon"]{opacity: .6;} [data-class*="tpw_icon"]:hover{opacity: 1;}'));
  document.body.appendChild(styleNode);

  // 判断是否有form input，有则将入监听事件
  var addListener = false;
  var ff = document.forms[0];
  if (!ff || !ff.elements) {
    return;
  }
  for (var i = 0; i < ff.elements.length; i++) {
    var ee = ff.elements[i];
    if ("INPUT" == ee.tagName) {
      addListener = true;
      this.createIcon(ee);
    };
  }
  if (addListener) {
    console.log('addIconsListener');
    var that = this;
    setInterval(function() {
      that.iconsListener();
    }, 800);
  }

}

// 获取input元素靠右对齐的绝对路径
contentIcons.prototype.offset = function(ele) {
  if (!ele) {
    return;
  }
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

// 创建并插入icon
contentIcons.prototype.createIcon = function(ele) {
  var dataClass = 'tpw_icon_' + Math.round(Math.random() * 100000);
  ele.className = ele.className + ' ' + dataClass;
  var iconStyle = this.offset(ele);
  var icon = document.createElement('div');
  var attr = document.createAttribute("data-class");
  attr.nodeValue = dataClass;
  icon.setAttributeNode(attr);
  icon.style.top = iconStyle.top + 'px';
  icon.style.left = iconStyle.left + 'px';
  var newIconArr = {
    dataClass: dataClass,
    top: iconStyle.top,
    left: iconStyle.left
  }
  this.icons.push(newIconArr);
  icon.style.position = 'absolute';
  icon.style.width = '16px';
  icon.style.height = '18px';
  icon.style.backgroundRepeat = 'no-repeat';
  icon.style.cursor = 'pointer';
  icon.style.zIndex = '999999';
  icon.style.backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAAXNSR0IArs4c6QAAAPhJREFUOBHlU70KgzAQPlMhEvoQTg6OPoOjT+JWOnRqkUKHgqWP4OQbOPokTk6OTkVULNSLVc62oJmbIdzd95NcuGjX2/3YVI/Ts+t0WLE2ut5xsQ0O+90F6UxFjAI8qNcEGONia08e6MNONYwCS7EQAizLmtG" +
    "UDEzTBNd1fxsYhjEBnHPQNG3KKTYV34F8ec/zwHEciOMYyrIE3/ehKAqIoggo9inGXKmFXwbyBkmSQJqmUNe15IRhCG3byphitm1/eUzDM4qR0TTNjEixGdAnSi3keS5vSk2UDKqqgizLqB4YzvassiKhGtZ/jDMtLOnHz7TE+yf8BaDZXA509yeBAAAAAElFTkSuQmCC')";
  var that = this;
  icon.onclick = function(e) {
    that.iconClick(e);
  };
  document.body.appendChild(icon);
};
// icon点击事件
contentIcons.prototype.iconClick = function(e) {
  var offset = {
    left: 0,
    top: 0
  };
  offset = this.offset(e.target);
  if (self.frameElement) {
    var frameOffset = self.frameElement.getBoundingClientRect()
    offset.left += frameOffset.left;
    offset.top += frameOffset.top + self.parent.document.body.scrollTop;
  }
  offset.top += 21;
  chrome.runtime.sendMessage({
    type: "openContentPopup",
    offset: offset
  });
  // console.log(e.target.attributes['data-class'].value);
};
// icons监听事件
contentIcons.prototype.iconsListener = function() {
  for (var i = 0; i < this.icons.length; i++) {
    var ele = document.querySelector('.' + this.icons[i].dataClass);
    if (this.offset(ele).top != this.icons[i].top || this.offset(ele).left != this.icons[i].left) {
      this.adjustIconPosition(this.icons[i].dataClass);
    }
  }
};
// 校正icon位置
contentIcons.prototype.adjustIconPosition = function(dataClass) {
  // 选择input框
  var ele = document.querySelector('.' + dataClass);
  var newIconStyle = this.offset(ele);
  // 选择icon框
  var iconEle = document.querySelector('[data-class=' + dataClass + ']');
  if (!iconEle) {
    return;
  }
  console.log('adjust to:' + newIconStyle.top + ' ' + newIconStyle.left);

  // 更新样式
  iconEle.style.top = newIconStyle.top + 'px';
  iconEle.style.left = newIconStyle.left + 'px';
  //更新本地数组
  for (var i = 0; i < this.icons.length; i++) {
    if (this.icons[i].dataClass == dataClass) {
      this.icons[i].top = newIconStyle.top;
      this.icons[i].left = newIconStyle.left;
    }
  }
};

var contentIcons = new contentIcons();
