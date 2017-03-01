function showErrorMessage(content, delay) {
  document.getElementById('_tip').className = 'show';
  document.querySelector('.tip-content').innerText = content;
  setTimeout(function () {
    document.getElementById('_tip').className = '';
  }, delay || 3000);
}

function showTip(content, color) {
  document.getElementById('tip').style.color = color;
  document.getElementById('tip').innerText = content;
}

function checkKeyClick() {
  document.getElementById('_loading').style.display = 'block';
  var port = chrome.runtime.connect({
    name: "checkKey"
  });
  port.postMessage({
    key: document.getElementById('savePassword').value,
  });
  port.onMessage.addListener(function (result) {
    document.getElementById('_loading').style.display = 'none';
    if (result.msg == 'ok') {
      saveClick();
    } else if (result.msg == 'noCheckUrl') {
      showTip('需要先输入数据库地址', 'white');
    } else if (result.msg == 'error') {
      showErrorMessage('密码错误');
    }
  });
}

function initClick() {
  document.getElementById('_loading').style.display = 'block';
  var port = chrome.runtime.connect({
    name: "initDatabase"
  });
  port.postMessage({
    url: document.getElementById('dataBaseURL').value,
    key: document.getElementById('savePassword').value,
  });
  port.onMessage.addListener(function (result) {
    document.getElementById('_loading').style.display = 'none';
    if (result.msg == 'ok') {
      window.close();
    } else {
      showErrorMessage(result.msg);
    }
  });
}

function saveClick() {
  document.getElementById('_loading').style.display = 'block';
  var port = chrome.runtime.connect({
    name: "setKey"
  });
  port.postMessage({
    url: document.getElementById('dataBaseURL').value,
    key: document.getElementById('savePassword').value,
  });
  port.onMessage.addListener(function (result) {
    document.getElementById('_loading').style.display = 'none';
    if (result.msg == 'ok') {
      window.close();
    } else {
      showErrorMessage(result.msg);
    }
  });
}

function nextClick() {
  if (!document.getElementById('dataBaseURL').value.match(/^https?:/ig)) {
    showErrorMessage('请输入规范的URL');
    return;
  }

  document.getElementById('_loading').style.display = 'block';
  var port = chrome.runtime.connect({
    name: "checkUrl"
  });
  port.postMessage({
    url: document.getElementById('dataBaseURL').value.replace(/^\s+|\s+$/ig, '')
  });
  port.onMessage.addListener(function (result) {
    document.getElementById('_loading').style.display = 'none';
    // 进入下一步
    if (result.msg == 'networkError') {
      showErrorMessage('网络错误');
      return;
    }
    document.getElementById('passwordArea').style.display = 'block';
    document.getElementById('databaseArea').style.display = 'none';
    if (result.msg == 'ok') {
      document.getElementById('saveButton').setAttribute('action', 'checkKey');
      document.getElementById('saveButton').innerText = '校验密码';
      showTip('当前数据库共有条数：' + result.num, 'white');
    } else if (result.msg == 'null') {
      document.getElementById('saveButton').setAttribute('action', 'init');
      document.getElementById('saveButton').innerText = '初始化';
      showTip('这可能是一个新的数据库，输入密码进行初始化操作', 'yellow');
    }
  });
}

function clearClick() {
  document.getElementById('_loading').style.display = 'block';
  var port = chrome.runtime.connect({
    name: "setKey"
  });
  port.postMessage({
    url: '',
    key: '',
  });
  port.onMessage.addListener(function (result) {
    document.getElementById('_loading').style.display = 'none';
    if (result.msg == 'noSetting') {
      location.reload();
    } else {
      showErrorMessage(result.msg);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  
  document.forms[0].onsubmit = function (e) {
    return false;
  }
  if (!localStorage.url || !localStorage.privateKey) {
    document.forms[0].style.display = 'block';
    document.getElementById('dataBaseURL').value = localStorage.url ? localStorage.url : '';
  } else {
    document.getElementById('setting').style.display = 'block';
    document.getElementById('dataBaseURLP').innerText = localStorage.url;
    document.getElementById('check-1').checked = localStorage.cfg_clearKeyOnLaunch == 'true' ? true : false;
  }
  document.getElementById('check-1').addEventListener('click', function () {
    localStorage.cfg_clearKeyOnLaunch = document.getElementById('check-1').checked;
  });
  document.getElementById('saveButton').addEventListener('click', function () {
    if (document.getElementById('saveButton').attributes['action']) {
      switch (document.getElementById('saveButton').attributes['action'].value) {
        case 'init':
          initClick();
          break;
        case 'save':
          saveClick();
          break;
        case 'checkKey':
          checkKeyClick();
          break;
        default:
          nextClick();
          break;
      }
    }
  });
  document.getElementById('clearSetting').addEventListener('click', function () {
    clearClick();
  });
});