var selectNode = document.body;
var newNode;
var newChildNode;
var styleNode;
var oriStyle = {};
var input1 = input2 = '';
var currentInput = 'input1';

newNode = document.createElement("div");
newNode.className = "temptest";
newNode.style.position = "fixed";
newNode.style.top = 0;
newNode.style.zIndex = 999999;
newNode.style.left = '50%';
newNode.style.transform ='translate(-50%,0)';
newNode.style.textAlign = "center";
newChildNode = document.createElement("div");
newChildNode.style.padding = "10px 20px";
newChildNode.href = "#";
newChildNode.style.fontSize = "13px";
newChildNode.style.backgroundColor = "#0fbb14";
// newChildNode.style.display = "inline-block";
newChildNode.style.color = "#fff";
newChildNode.innerHTML = '请聚焦到一个输入框<a class="tbtn b l" data-temp="cancel">关闭</a>';

newNode.appendChild(newChildNode);
document.body.appendChild(newNode);

styleNode =document.createElement("style");
styleNode.setAttribute("type","text/css");
styleNode.appendChild(document.createTextNode('.temptest .tbtn{cursor:pointer;} .temptest .b{font-weight:bold;} .temptest .l{padding-left:16px;} .temptest .y{color:yellow;} .temptest .r{color:red}'));
document.body.appendChild(styleNode);



function showTip() {
  oriStyle != ({}) ? selectNode.style = oriStyle : null;
  selectNode = document.activeElement;
  oriStyle = selectNode.style;
  selectNode.style.background = 'rgba(255,0,0,.2)';
  newChildNode.innerHTML = innerHTML();
  // newChildNode.innerHTML = '确定是变红的这个节点吗？<a onclick="tempok()" href="javascript:;" style="color:white;font-weight:bold;padding-left:16px;">确定</a><a onclick="tempcancel()" href="javascript:;" style="color:white;font-weight:bold;padding-left:16px;">关闭</a>';
}

function innerHTML() {
  var html = '';
  var className = '';
  var className1 = (selectNode.attributes.class ? selectNode.attributes.class.nodeValue : '');
  className1 = className1.split(' ');
  for (var i in className1) {
    className += '<span class="tbtn y" data-temp="input">.';
    className += className1[i];
    className += '</span><br><br>';
  }
  html = '<span class="tbtn y" data-temp="input">';
  html += '#' + (selectNode.attributes.id ? selectNode.attributes.id.nodeValue : '');
  html += '</span><br><br>';
  html += '<span class="tbtn y"  data-temp="input">';
  html += selectNode.attributes.name ? ('[name=' + selectNode.attributes.name.nodeValue + ']') : 'name';
  html += '</span><br><br>';
  html += '<span class="tbtn y" data-temp="input">';
  html += '[type=' + (selectNode.attributes.type ? selectNode.attributes.type.nodeValue : '') + ']';
  html += '</span><br><br>';
  html += className;
  html += '请选择以上一个识别属性<br><br>';

  html += currentInput == 'input1' ? '<span class="tbtn r" data-temp="input1">input1</span>' : '<span class="tbtn" data-temp="input1">input1</span>';
  html += '的属性值为<br>' + input1 + '<br>';
  html += currentInput == 'input2' ? '<span class="tbtn r" data-temp="input2">input2</span>' : '<span class="tbtn" data-temp="input2">input2</span>';
  html += '的属性值为<br>' + input2 + '<br>';
  html += '<br><a data-temp="ok" class="tbtn l b">确定</a><a data-temp="cancel"class="tbtn l b">关闭</a><br>';

  return html;
}

document.onclick = function(e) {
  if (e.target.tagName == 'INPUT'){
    e.target.type == 'password' ? currentInput = 'input2' : currentInput = 'input1'
    showTip();
  }
}

var divs = document.querySelector('body');
divs.addEventListener('click', tempclick);

function tempclick(e) {
  if (e.target.getAttribute("data-temp") == "input") {
    currentInput == 'input1' ? input1 = e.target.innerText : input2 = e.target.innerText;
    newChildNode.innerHTML = innerHTML();
  } else if (e.target.getAttribute("data-temp") == "input1") {
    currentInput = 'input1';
    newChildNode.innerHTML = innerHTML();
  } else if (e.target.getAttribute("data-temp") == "input2") {
    currentInput = 'input2';
    newChildNode.innerHTML = innerHTML();
  } else if (e.target.getAttribute("data-temp") == "ok") {
    chrome.runtime.sendMessage({
        type: "getInput",
        input1: input1,
        input2: input2
      },
      function(response) {
        response.msg == 'ok' ? close() : null;
      });

  } else if (e.target.getAttribute("data-temp") == "cancel") {
    close();
  }
}

function close() {
  if (newNode && newNode.remove) {
    newNode.remove();
  }
  selectNode.style = oriStyle;
  divs.removeEventListener('click', tempclick);
  document.onclick = null;
}
