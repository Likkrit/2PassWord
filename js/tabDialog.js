document.addEventListener('DOMContentLoaded', function() {

  if (localStorage.tpw_tabDialogForms) {
    var item = JSON.parse(localStorage.tpw_tabDialogForms);
    console.log(item);
    document.getElementById('siteDialogURL').value = item.host || '';
    document.getElementById('siteDialogName').value = '';
    document.getElementById('siteDialogId').value = item.id || '';
    document.getElementById('siteDialogGroup').value = item.identify || '';
    document.getElementById('siteDialogUsername').value = item.userName || '';
    document.getElementById('siteDialogPassword').value = item.passWord || '';
    document.getElementById('siteDialogNotes').value = '';
    document.getElementById('dialogInput1').value = item.inputId1 || '';
    document.getElementById('dialogInput2').value = item.inputId2 || '';
    localStorage.removeItem('tpw_tabDialogForms');
  } else if (localStorage.tpw_tabDialogId) {
    var port = chrome.runtime.connect({
      name: "getItem"
    });
    port.postMessage({
      id: localStorage.tpw_tabDialogId
    });
    port.onMessage.addListener(function(result) {
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
    } else {
      document.querySelector('.showPassword').className = document.querySelector('.showPassword').className + ' selected';
      document.getElementById('siteDialogPassword').type = 'text';
    }
  });

  document.getElementById('cancel').addEventListener('click', function() {
    window.close();
  });

  document.getElementById('delete').addEventListener('click', function() {
    if (!document.getElementById('siteDialogId').value) {
      alert('表单不可用');
      return;
    }
    document.getElementById('_loading').style.display = "block";

    var port = chrome.runtime.connect({
      name: "deleteItem"
    });
    port.postMessage({
      id: document.getElementById('siteDialogId').value
    });
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        window.close();
      } else {
        document.getElementById('_loading').style.display = "none";
        alert(result.msg);
      }
    });
  });
  document.getElementById('save').addEventListener('click', function() {
    if (!document.getElementById('siteDialogId').value) {
      alert('表单不可用');
      return;
    }
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
    document.getElementById('_loading').style.display = "block";
    port.onMessage.addListener(function(result) {
      if (result.msg == 'ok') {
        document.getElementById('_loading').style.display = "none";
        window.close();

      } else {
        document.getElementById('_loading').style.display = "none";
        alert(result.msg);
      }
    });

  });

});
