document.addEventListener('DOMContentLoaded', function() {

  if (localStorage.tpw_tabDialogId) {
    var port = chrome.runtime.connect({
      name: "getItem"
    });
    port.postMessage({
      id: localStorage.tpw_tabDialogId
    });
    port.onMessage.addListener(function(result) {
      console.log(result.item);
      document.getElementById('siteDialogURL').value = result.item.host || '';
      document.getElementById('siteDialogName').value = result.item.name || '';
      document.getElementById('siteDialogId').value = result.item.id || '';
      document.getElementById('siteDialogGroup').value = result.item.identify || '';
      document.getElementById('siteDialogUsername').value = result.item.userName || '';
      document.getElementById('siteDialogPassword').value = result.item.passWord || '';
      document.getElementById('siteDialogNotes').value = result.item.other || '';
      document.getElementById('dialogInput1').value = result.item.inputId1 || '';
      document.getElementById('dialogInput2').value = result.item.inputId2 || '';
    });
    localStorage.removeItem('tpw_tabDialogId');
  }
  document.querySelector('.showPassword').addEventListener('click', function() {
    if (document.querySelector('.showPassword').className.indexOf('selected') >= 0) {
      document.querySelector('.showPassword').className = document.querySelector('.showPassword').className.replace(/selected/, '');
      document.getElementById('siteDialogPassword').type = 'password';
    }
    else{
      document.querySelector('.showPassword').className = document.querySelector('.showPassword').className + ' selected';
      document.getElementById('siteDialogPassword').type = 'text';
    }
  });

  document.getElementById('cancel').addEventListener('click', function() {
    window.close();
  });

  document.getElementById('save').addEventListener('click', function() {
    // 增加一个item
    var newItem = {
      id: document.getElementById('siteDialogId').value || '',
      name: document.getElementById('siteDialogName').value || '',
      userName: document.getElementById('siteDialogUsername').value || '',
      passWord: document.getElementById('siteDialogPassword').value || '',
      other: document.getElementById('siteDialogNotes').value || '',
      host: document.getElementById('siteDialogURL').value || '',
      identify: document.getElementById('siteDialogGroup').value || '',
      inputId1: document.getElementById('dialogInput1').value || '',
      inputId2: document.getElementById('dialogInput2').value || '',
    };
    var port = chrome.runtime.connect({
      name: "addItem"
    });
    port.postMessage({
      newItem: newItem
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        window.close();
      } else {
        alert(result.msg);
      }
    });

  });

});
