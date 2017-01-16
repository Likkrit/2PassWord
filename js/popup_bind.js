$(document).ready(function() {
  // document.addEventListener('DOMContentLoaded', function() {
  // 弹出opUp
  // 冒泡 注册插入点击事件
  // var divs = document.querySelector('body');
  // divs.addEventListener('click', click);

  // 初始化，显示列表页
  if(localStorage.pageAdding){
    popUp.renderPage({
      id: new Date().getTime(),
      inputId1 : localStorage.pageInput1 || '',
      inputId2 : localStorage.pageInput2 || '',
    });
    $('#page')
      .transition('scale');
    $('#add')
      .css({
        'visibility': 'hidden'
      });
    $('#back')
      .css({
        'visibility': 'visible'
      });
  }
  else if ($('#items').hasClass('hidden')) {
    $('#items')
      .transition({
        animation: 'fade',
        duration: 600
      });
  }


  $('.search.link')
    .popup({
      position : 'top center',
    })
  ;

  // input框 搜索按钮点击时
  $('.get-input').on('click',function(){
    localStorage.pageAdding = true;
    chrome.tabs.executeScript(null, {
      file: "./js/content_script_get_input.js",
      allFrames: true
    });
    window.close();
  });

  // host框 按钮点击时
  $('.get-host').on('click',function(){
    if (chrome && chrome.tabs)
      chrome.tabs.getSelected(function(tab) {
        $("[name=host]").val(tab.url.replace(/https?:\/\//,'') || '')
      });
  })

  // 增加按钮点击时
  $('#add').on('click', function() {
    popUp.renderPage({
      id: new Date().getTime(),
    });
    $('#page')
      .transition('scale');
    $('#items')
      .transition('hide');
    $('#add')
      .css({
        'visibility': 'hidden'
      });
    $('#back')
      .css({
        'visibility': 'visible'
      });
  });
  // 取消按钮点击时
  $('#cancel').on('click', function() {
    localStorage.removeItem('pageAdding');
    localStorage.removeItem('pageInput2');
    popUp.renderPage({
      name: '',
      userName: '',
      passWord: '',
      inputId1: '',
      inputId2: ''
    });
    $('#page')
      .transition('hide');
    $('#items')
      .transition('fade right');
    $('#add')
      .css({
        'visibility': 'visible'
      });
    $('#back')
      .css({
        'visibility': 'hidden'
      });
  });
  // 后退按钮点击时
  $('#back').on('click', function() {
    localStorage.removeItem('pageAdding');
    localStorage.removeItem('pageInput2');
    popUp.renderPage({
      name: '',
      userName: '',
      passWord: '',
      inputId1: '',
      inputId2: ''
    });
    $('#page')
      .transition('hide');
    $('#items')
      .transition('fade right');
    $('#add')
      .css({
        'visibility': 'visible'
      });
    $('#back')
      .css({
        'visibility': 'hidden'
      });
  });


  // 单个条目点击时
  $('#items').on('click', '.item', function(event) {
    event.stopPropagation();
    var dataId = $(this).attr('data-id');
    var item = popUp.getItemFromPopUp(dataId);
    if (item) {
      $('#page')
        .transition('scale');
      $('#items')
        .transition('hide');
      $('#add')
        .css({
          'visibility': 'hidden'
        });
      $('#back')
        .css({
          'visibility': 'visible'
        });
      popUp.renderPage(item);
    }
  });

  // 插入按钮点击时
  $('#items').on('click', '.insert', function(event) {
    event.stopPropagation();
    var dataId = $(this).parent().parent().attr('data-id');
    dataId = $(this).parent().parent().data('id');
    // var dataId = e.target.getAttribute("data-id") || e.target.parentNode.getAttribute("data-id") || e.target.parentNode.parentNode.getAttribute("data-id");
    var code = "window.item='" + popUp.getItemJSONFromPopUp(dataId) + "';item=JSON.parse(item);";
    chrome.tabs.executeScript(null, {
      code: code,
      allFrames: true
    });
    chrome.tabs.executeScript(null, {
      file: "./js/content_script.js",
      allFrames: true
    });
    window.close();
  });


  // 保存按钮 点击事件
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
  passwordInput.addEventListener('mouseover', function() {
    passwordInput.type = "text";
  });
  passwordInput.addEventListener('mouseout', function() {
    passwordInput.type = "password";
  });


  // 获取当前标签页URL
  if (chrome && chrome.tabs)
    chrome.tabs.getSelected(function(tab) {
      popUp.url = tab.url || "";
      popUp.getItemsFromBackground(popUp.url);
    });
});
