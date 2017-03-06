function contentIcons() {
  // 创建style
  var styleNode = document.createElement("style");
  styleNode.setAttribute("type", "text/css");
  var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4T2NkoBAwIukXALL9gViBgJkPgPIbgfgDSB2yAQVAfj+RDioEqpuAbkADUKAeiB0JGLIfKN8IxCD1KC6AGYDsqgtANf+B2BDJUBCfaAM2QDUGkGMAcpjA/Qx1EVEugHkJZDlcA7EGgKJSHi0wHwL5D4g1wAGoEISRwQEgB4SJCkSQZns0Aw6SYgDICyCMDEDOJ8oL6E5HMwfsDayxQHFSBmUmUIJBdzq6C0DeWAATRE626AqJ4gMAKh82EQu8MAEAAAAASUVORK5CYII=';
  var g_sites_light_ico = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAAXNSR0IArs4c6QAAAPhJREFUOBHlU70KgzAQPlMhEvoQTg6OPoOjT+JWOnRqkUKHgqWP4OQbOPokTk6OTkVULNSLVc62oJmbIdzd95NcuGjX2/3YVI/Ts+t0WLE2ut5xsQ0O+90F6UxFjAI8qNcEGONia08e6MNONYwCS7EQAizLmtGUDEzTBNd1fxsYhjEBnHPQNG3KKTYV34F8ec/zwHEciOMYyrIE3/ehKAqIoggo9inGXKmFXwbyBkmSQJqmUNe15IRhCG3byphitm1/eUzDM4qR0TTNjEixGdAnSi3keS5vSk2UDKqqgizLqB4YzvassiKhGtZ/jDMtLOnHz7TE+yf8BaDZXA509yeBAAAAAElFTkSuQmCC';
  var g_sites_ico = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAAXNSR0IArs4c6QAAANJJREFUOBHdUzsOgzAMfaDOiIETcBjUDozcjetwh3CBdsnAgLiAa1uyG+gAtJ1qyYljv+dPAgBwY72z0kEV7JXV5QzZighHJeNVnJ+IcJGfYVZVhbZt3yjW1u7edR2FEAynibyDsiw9c1EUyHMPIY1lmXbuWEX1fY9pmtA0Deq6RowRwzAoKI05KzFeZRLnWVNn4jZtNuIRiEfws8XkDsZxNL/WuVi1eZ7NxLIsbothMSKC6FYs4+7Oz0j8jIbTPD/5kB7blg6cV5yvf6YDBf8a8gSLtXzq+l6rIQAAAABJRU5ErkJggg==";
  var g_close_light_ico = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA3UlEQVQ4EaVTOQ7CMBCMETShzcdo4CVOkyJykQb/AXoaPsQT0uLGRZhZxVIirSMDljberOfwaaZpqv5pe5Kttce6rs8QO5SIGWNiCOHhvX+LAMko3hAlfMGAw/6+47fUmdjUEkcEUvGXPicwwqFFxDlaiI+agSoA0tU550G4MJizpgnIJioDQ9/3LxCfHEN+QjcouEqdgQbM1XICHd3pzJhn0mki6hJwH1oQiZdpI+9YKxYAsAFhuWnLfKWTW8IKtPUjAnCLWyBtLHFkD/gweLdx1l89JgobkDSD4toHHT5aJu9+N80AAAAASUVORK5CYII=";
  var g_close_ico = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAl0lEQVQ4T7VTgQ2AIAyTC/RD9QO9QLxAP1A/1A9sDZgFo0CQJctcWOs6hioSTRl8hVjDGUNsR9EG3y1Bh2QKQYqaHt+zJdBIhkiCEfU6G8HB9kRX/BtllqLLzw6uQ3hjAKvJpUyvhBYgAmkkWpwZ5SVIlsBF4RA5BxojhygXzSvBkfxI/yVIXmVq41XFPCZe8f2YfHpfz0+q7C4R/Q4GAgAAAABJRU5ErkJggg==";
  var cssNodeText = '[class*="tpw_icon"]{background-image: url("' + g_sites_light_ico + '")!important;background-position: 98% 50%!important;background-repeat: no-repeat!important;}';
  cssNodeText += '[class*="tpw_icon"]:hover{background-image: url("' + g_sites_ico + '")!important;background-position: 98% 50%!important;background-repeat: no-repeat!important;}';
  cssNodeText += '[class*="tpw_close"]{background-image: url("' + g_close_ico + '")!important;background-position: 98% 50%!important;background-repeat: no-repeat!important;}';
  cssNodeText += '[class*="tpw_close"]:hover{background-image: url("' + g_close_ico + '")!important;background-position: 98% 50%!important;background-repeat: no-repeat!important;}';
  styleNode.appendChild(document.createTextNode(cssNodeText));
  document.body.appendChild(styleNode);
  this.inputsNum = 0;
  this.iframesNum = 0;
  this.inputArr = [];
  this.domNodeFind();
  var that = this;
  // 事件绑定

  document.addEventListener('mousemove', function (e) {
    if (!that.inputCheck2(e.target)) return;
    if (that.mouseOnIcon(e)) {
      e.target.style.cursor = 'pointer';
    } else {
      e.target.style.cursor = 'auto';
    }
  });
  document.addEventListener('click', function (e) {
    if (!that.inputCheck2(e.target)) return;
    if (that.mouseOnIcon(e)) {
      that.iconClick(e);
    }
  });
  document.addEventListener('DOMNodeInserted', function () {
    that.domNodeFind();
  }, false);

  // 表单提交事件绑定 开始
  for (var i = 0; i < document.forms.length; i++) {
    document.forms[i].onsubmit = function (e) {
      formsSumit(e.target);
    }
  }

  function formsSumit(form) {
    var newForm = [];
    for (var i = 0; i < form.length; i++) {
      if (form[i].tagName == 'INPUT' && form[i].value && form[i].type != 'hidden' && form[i].type != 'submit' && form[i].value.length > 2) {
        newForm.push({
          id: form[i].id,
          name: form[i].name,
          value: form[i].value,
          type: form[i].type
        });
      }
    }
    var object = {
      url: location.href,
      identify: location.host,
      form: newForm
    }
    if (object.form.length >= 2) {
      chrome.runtime.sendMessage({
        type: "formSumit",
        object: object
      });
    }
  }
  // 表单提交事件绑定 结束

  // 提交后显示是否记住密码 按钮 开始
  if (top == self) {
    chrome.runtime.sendMessage({
      type: "isShowTips",
      url: location.href
    }, function (response) {
      if (response) {
        var newNode = document.createElement("div");
        newNode.className = "temptest";
        newNode.style.position = "fixed";
        newNode.style.top = 0;
        newNode.style.zIndex = 999999;
        newNode.style.backgroundColor = "#0fbb14";
        newNode.style.width = "100%";
        // newNode.style.textAlign = "center";
        var newChildNode = document.createElement("span");
        newChildNode.style.padding = "10px 20px";
        newChildNode.style.fontSize = "13px";
        newChildNode.style.display = "inline-block";
        newChildNode.style.float = "left";
        newChildNode.style.color = "#fff";
        newChildNode.innerHTML = "是否允许2PassWord记住此密码？";
        newNode.appendChild(newChildNode);
        newChildNode = document.createElement("span");
        newChildNode.style.padding = "3px 13px";
        newChildNode.style.margin = "8px 8px 8px 0";
        newChildNode.style.fontSize = "13px";
        newChildNode.style.display = "inline-block";
        newChildNode.style.color = "#0fbb14";
        newChildNode.style.backgroundColor = "#fff";
        newChildNode.style.float = "right";
        newChildNode.style.cursor = "pointer";
        newChildNode.className = "tpw_action_cancel";
        newChildNode.innerHTML = "取消";
        newNode.appendChild(newChildNode);
        newChildNode = document.createElement("span");
        newChildNode.style.padding = "3px 13px";
        newChildNode.style.margin = "8px 8px 8px 0";
        newChildNode.style.fontSize = "13px";
        newChildNode.style.display = "inline-block";
        newChildNode.style.color = "#0fbb14";
        newChildNode.style.backgroundColor = "#fff";
        newChildNode.style.cursor = "pointer";
        newChildNode.style.float = "right";
        newChildNode.className = "tpw_action_save";
        newChildNode.innerHTML = "保存";
        newNode.appendChild(newChildNode);
        document.body.appendChild(newNode);
        document.querySelector('.tpw_action_cancel').addEventListener('click', function () {
          document.querySelector(".temptest").remove();
          chrome.runtime.sendMessage({
            type: "tipsCancel",
          });
        });
        document.querySelector('.tpw_action_save').addEventListener('click', function () {
          document.querySelector(".temptest").remove();
          chrome.runtime.sendMessage({
            type: "tipsSave",
          });
        });
      }
    });
  }
  // 提交后显示是否记住密码 按钮 结束
}
contentIcons.prototype.domNodeFind = function () {
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
    this.inputCollect();
    for (i = 0; i < inputs.length; i++) {
      if (inputs[i].className.indexOf('tpw_icon') <= 0 && this.inputCheck2(inputs[i])) {
        inputs[i].className = inputs[i].className + ' tpw_icon';
        console.log('加入了一个图标');
      }
    }
    this.inputsNum = inputs.length;
  }
  inputs = [];
}
// 符合条件的输入框
contentIcons.prototype.inputCollect = function () {
  var inputArr = [];
  var inputs = document.getElementsByTagName('input');
  for (var i = 0; i < inputs.length; i++) {
    if (this.inputTypeCheck(inputs[i])) {
      inputArr.push(inputs[i]);
    }
  }
  inputs = [];
  for (i = 0; i < inputArr.length; i++) {
    inputs.push(this.offsetTL(inputArr[i]));
    inputs[i].target = inputArr[i];
  }
  for (i = 0; i < inputs.length; i++) {
    for (var j = i + 1; j < inputs.length; j++) {
      if (inputs[i].left == inputs[j].left) {
        inputs[i].active = true;
        inputs[j].active = true;
      }
    }
  }
  inputArr = [];
  for (i = 0; i < inputs.length; i++) {
    if (inputs[i].active) {
      inputArr.push(inputs[i]);
    }
  }
  this.inputArr = inputArr;
}
// 输入框类型检测
contentIcons.prototype.inputCheck2 = function (ele) {
  for (i = 0; i < this.inputArr.length; i++) {
    if (this.inputArr[i].target == ele) {
      return true;
    }
  }
  return false;
}
// 输入框类型检测
contentIcons.prototype.inputTypeCheck = function (ele) {
  if (ele.nodeName == 'INPUT' && ele.attributes["type"]) {
    if ((ele.name && ele.name.toLowerCase().indexOf('search') >= 0) ||
      (ele.className && ele.className.toLowerCase().indexOf('search') >= 0) ||
      (ele.id && ele.id.toLowerCase().indexOf('search') >= 0) ||
      (ele.attributes && ele.attributes["placeholder"] && ele.attributes["placeholder"].value.toLowerCase().indexOf('search') >= 0))
      return false;
    if (ele.attributes["type"].value == 'text' ||
      ele.attributes["type"].value == 'password' ||
      ele.attributes["type"].value == 'email')
      return true;
  }
  return false;
}
// 鼠标是否在input的图标上
contentIcons.prototype.mouseOnIcon = function (e) {
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
contentIcons.prototype.offset = function (ele) {
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
// 获取位于input元素0 0位置的绝对坐标
contentIcons.prototype.offsetTL = function (ele) {
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
// 点击事件
contentIcons.prototype.iconClick = function (e) {
  var offset = {
    left: 0,
    top: 0
  };
  offset = this.offset(e.target);
  offset.top += 21;

  // 获取input字段
  var ele = e.target;
  var forms = [];
  var targetForm = ele.form ? ele.form.elements : document.getElementsByTagName('input');

  if (targetForm.length > 0) {
    for (var i = 0; i < targetForm.length; i++) {
      var inputParm = {
        value: targetForm[i].value,
        name: targetForm[i].name,
        type: targetForm[i].type,
      }
      if (inputParm.type == 'text' ||
        inputParm.type == 'password' ||
        inputParm.type == 'email' ||
        inputParm.name == 'email')
        forms.push(inputParm);
    }
  }
  // 设置关闭样式
  var closeIcon = document.querySelector('.tpw_close.tpw_icon');
  if (e.target == closeIcon) { // 如果存在close状态按钮 并是当前的按钮时
    closeIcon.className = closeIcon.className.replace(/tpw_icon tpw_close/ig, 'tpw_icon'); // 清除close状态
    //关闭popup
    chrome.runtime.sendMessage({
      type: "closeContentPopup"
    });
    // // 如果该按钮是普通状态 
  } else if (e.target.className && !/tpw_close/ig.test(e.target.className)) { // 如果该按钮是普通按钮
    if (closeIcon) { // 存在close状态按钮时
      closeIcon.className = closeIcon.className.replace(/tpw_icon tpw_close/ig, 'tpw_icon'); // 清除close状态
    }
    e.target.className = e.target.className.replace(/tpw_icon/ig, 'tpw_icon tpw_close'); // 增加close状态

    chrome.runtime.sendMessage({
      type: "openContentPopup",
      offset: offset,
      iframe: top != self ? true : false,
      saveForms: forms
    });
  }


};
var icons = icons ? icons : new contentIcons();