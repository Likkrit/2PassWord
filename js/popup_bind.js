$(document).ready(function() {
  // document.addEventListener('DOMContentLoaded', function() {
  // 弹出opUp
  // 冒泡 注册插入点击事件
  // var divs = document.querySelector('body');
  // divs.addEventListener('click', click);

  // 初始化，显示列表页
  if (localStorage.pageAdding) {
    // 如果有保存的状态，恢复状态
    popUp.renderPage({
      id: localStorage.pageID || '',
      inputId1: localStorage.pageInput1 || '',
      inputId2: localStorage.pageInput2 || '',
      name: localStorage.pageName || '',
      userName: localStorage.pageUserName || '',
      passWord: localStorage.pagePassWord || '',
      other: localStorage.pageOther || '',
      host: localStorage.pageHost || ''
    });
    $('#page').transition('scale');
    $('#add').css({
      'visibility': 'hidden'
    });
    $('#back').css({
      'visibility': 'visible'
    });
  }
  // tooltip提示初始化
  $('.search.link').popup({
    position: 'top center',
  });

  // input框 搜索按钮点击时
  $('.get-input').on('click', function() {
    // 保存当前页面状态
    localStorage.pageAdding = true;
    localStorage.pageID = $("[name=id]").val();
    localStorage.pageName = $("[name=name]").val();
    localStorage.pageUserName = $("[name=username]").val();
    localStorage.pagePassWord = $("[name=password]").val();
    localStorage.pageOther = $("[name=other]").val();
    localStorage.pageHost = $("[name=host]").val();
    localStorage.pageInput1 = $("[name=input1]").val();
    localStorage.pageInput2 = $("[name=input2]").val();
    chrome.tabs.executeScript(null, {
      file: "./js/content_script_get_input.js",
      allFrames: true
    });
    window.close();
  });

  // host框 按钮点击时
  $('.get-host').on('click', function() {
    if (chrome && chrome.tabs)
      chrome.tabs.getSelected(function(tab) {
        $("[name=host]").val(tab.url.replace(/https?:\/\/([\w\.\-:]+)\/.*/ig, '$1') || '');
      });
  });
  $('.open-host').on('click', function() {
    $('[name=host]').val() ? window.open('http://' + $('[name=host]').val()) : null;
  });
  // 增加按钮点击时
  $('#add').on('click', function() {
    popUp.renderPage({
      id: new Date().getTime(),
    });
    $('#page').transition('scale');
    $('#items').transition('hide');
    $('#add').css({
      'visibility': 'hidden'
    });
    $('#back').css({
      'visibility': 'visible'
    });
  });

  // 取消按钮点击时
  $('#cancel').on('click', function() {
    exitPage();
  });
  // 后退按钮点击时
  $('#back').on('click', function() {
    exitPage();
  });

  var exitPage = function() {
    // 移除已经保存的状态
    localStorage.removeItem('pageAdding');
    localStorage.removeItem('pageInput1');
    localStorage.removeItem('pageName');
    localStorage.removeItem('pageInput2');
    localStorage.removeItem('pageID');
    localStorage.removeItem('pageUserName');
    localStorage.removeItem('pagePassWord');
    localStorage.removeItem('pageOther');
    localStorage.removeItem('pageHost');

    popUp.renderPage({
      name: '',
      userName: '',
      passWord: '',
      inputId1: '',
      inputId2: ''
    });
    $('#page').transition('hide');
    $('#items').transition('show');
    // .transition('fade right');
    $('#add').css({
      'visibility': 'visible'
    });
    $('#back').css({
      'visibility': 'hidden'
    });
  };

  // 单个条目点击时
  $('#items').on('click', '.item', function(event) {
    event.stopPropagation();
    popUp.getItem($(this).attr('data-id'));
  });

  // 插入按钮点击时
  $('#items').on('click', '.insert', function(event) {
    event.stopPropagation();
    popUp.insertContentScript($(this).parent().parent().data('id'));
  });

  // 提交按钮 点击事件
  $('#sumit').on('click', function() {
    $('#page form').addClass('loading');
    popUp.addItem({
      id: document.querySelector("[name=id]").value || '',
      name: document.querySelector("[name=name]").value || '',
      userName: document.querySelector("[name=username]").value || '',
      passWord: document.querySelector("[name=password]").value || '',
      other: document.querySelector("[name=other]").value || '',
      host: document.querySelector("[name=host]").value || '',
      inputId1: document.querySelector("[name=input1]").value || '',
      inputId2: document.querySelector("[name=input2]").value || '',
    });
  });

  // 删除按钮 点击时
  $('#delete').on('click', function() {
    $('#page form').addClass('loading');
    popUp.deleteItem(document.querySelector("[name=id]").value);
  });

  // 密码框 鼠标移入移出事件
  var passwordInput = document.querySelector("[name=password]");
  document.querySelector(".icon.unhide").addEventListener('mouseover', function() {
    $(this).removeClass('unhide').addClass('hide');
    passwordInput.type = "text";
  });
  document.querySelector(".icon.unhide").addEventListener('mouseout', function() {
    $(this).removeClass('hide').addClass('unhide');
    passwordInput.type = "password";
  });

  // 获取当前标签页URL
  if (chrome && chrome.tabs)
    chrome.tabs.getSelected(function(tab) {
      popUp.getItems(tab.url || "");
    });
});
