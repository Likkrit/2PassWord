var selectNode = document.body;
var newNode;
tpw_offset = window.tpw_offset || {top:0,left:'50%'}
newNode = document.createElement("iframe");
newNode.className = 'tpw_iframe';
newNode.src = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/contentPopup.html?" + location.href;
newNode.width = '330';
newNode.height = '314';
newNode.style.top = tpw_offset.top + 'px';
newNode.style.left = tpw_offset.left + 'px';
newNode.style.transform ='translate(-50%,0)';
newNode.style.position = "absolute";
newNode.style.zIndex = 999999;
document.body.appendChild(newNode);
