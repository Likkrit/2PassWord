


document.onkeydown = function(event) {
  var e = event || window.event || arguments.callee.caller.arguments[0];
  if (e && e.keyCode == 90 && (e.ctrlKey || e.metaKey)) {
    console.log(document.activeElement.attributes);
    document.activeElement.style.background = 'rgba(255,0,0,.2)';
  }
};

item.inputId1 = item.inputId1 || "";
item.inputId2 = item.inputId2 || "";

item.inputId1 = item.inputId1.split("|");
item.inputId2 = item.inputId2.split("|");

var input,
  inputCount1 = 0,
  inputCount2 = 0;
for (var i = 0; i < item.inputId1.length; i++) {
  item.inputId1[i] = (item.inputId1[i] + '').replace(/(^\s+)|(\s+$)/g, "");
  if (item.inputId1[i]) {
    input = document.querySelector(item.inputId1[i]);
    if (input) {
      input.value = item.userName;
      inputCount1 ++;
    }
  }
}
for (var i = 0; i < item.inputId2.length; i++) {
  item.inputId2[i] = (item.inputId2[i] + '').replace(/(^\s+)|(\s+$)/g, "");
  if (item.inputId2[i]) {
    input = document.querySelector(item.inputId2[i]);
    if (input) {
      input.value = item.passWord;
      inputCount2 ++;
    }
  }
}

var newNode = document.createElement("div");
newNode.className = "temptest";
newNode.style.position = "fixed";
newNode.style.top = 0;
newNode.style.zIndex = 999999;
newNode.style.width = "100%";
newNode.style.textAlign = "center";
var newChildNode = document.createElement("span");
newChildNode.style.padding = "10px 20px";
newChildNode.style.fontSize = "13px";
newChildNode.style.backgroundColor = "#0fbb14";
newChildNode.style.display = "inline-block";
newChildNode.style.color = "#fff";
newChildNode.innerHTML = "填入了&nbsp;<strong>" + inputCount1 + "</strong>&nbsp;个用户名，&nbsp;<strong>" + inputCount1 + "</strong>&nbsp;个密码";
newNode.appendChild(newChildNode);
if(inputCount1 || inputCount2){
  document.body.appendChild(newNode);
  setTimeout(function() {
    document.querySelector(".temptest").remove();
  }, 1300);
}
item = {};
