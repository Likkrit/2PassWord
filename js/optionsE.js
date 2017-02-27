document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('dataBaseURL').value = localStorage.url ? localStorage.url : '';
  document.getElementById('savePassword').value = localStorage.privateKey ? localStorage.privateKey : '';

  document.getElementById('saveButton').addEventListener('click', function () {
    localStorage.url = document.getElementById('dataBaseURL').value;
    localStorage.privateKey = document.getElementById('savePassword').value;
    document.getElementById('_loading').style.display = 'block';
    var port = chrome.runtime.connect({
      name: "setKey"
    });
    port.postMessage({
      key: localStorage.privateKey
    });
    port.onMessage.addListener(function (result) {
      document.getElementById('_loading').style.display = 'none';
      if (result.msg == 'ok') {
        window.close();
      } else {
        // 显示错误
        alert(JSON.stringify(result.msg));
      }
    });
  });
});