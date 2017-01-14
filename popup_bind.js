// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


$(document).ready(function(){



// document.addEventListener('DOMContentLoaded', function() {
  // 弹出opUp
  // 冒泡 注册插入点击事件
  // var divs = document.querySelector('body');
  // divs.addEventListener('click', click);

  $('#add').on('click',function(){
    $('#page')
      .transition('scale')
    ;
    $('#items')
      .transition('hide')
    ;
  });

  $('#items').on('click','.item',function(){
    var dataId = $(this).attr('data-id');
    var item = popUp.getItemFromPopUp(dataId);
    if(item){
      $('#page')
        .transition('scale')
      ;
      $('#items')
        .transition('hide')
      ;
      popUp.renderItemDetail(item);
      // popUp.enterDetailPage(item);
    }
  });

  // 获取当前标签页URL
  chrome.tabs.getSelected(function(tab) {
    popUp.url = tab.url || "";
    popUp.getItemsFromBackground(popUp.url);
  });



});
/*
  // 密码框 鼠标移入移出事件
  var passwordInput = document.querySelector(".item-detail .pass-word");
  passwordInput.addEventListener('mouseover', function(){
    passwordInput.type = "text";
  });
  passwordInput.addEventListener('mouseout', function(){
    passwordInput.type = "password";
  });

  // 单机调试
  if (!chrome.tabs) {
    document.querySelector(".items").style.display = "block";
    document.querySelector(".item-detail").style.display = "none";
    document.querySelector(".items").style.opacity = 1;
    return;
  }
  document.querySelector(".item-detail").style.display = "none";

  if(localStorage.privateKey){
  }
  else {
    document.querySelector(".login-page").style.display = "flex";
  }




function click2(e) {
  var dataId;
  // 关闭按钮 点击事件
  if (e.target.getAttribute("data-action") == "close") {
    popUp.outDetailPage();
  }
  // 保存按钮 点击事件
  else if (e.target.getAttribute("data-action") == "save") {
    popUp.addItem({
      id: document.querySelector(".item-detail .id").value || '',
      name: document.querySelector(".item-detail .name").value || '',
      userName: document.querySelector(".item-detail .user-name").value || '',
      passWord: document.querySelector(".item-detail .pass-word").value || '',
      other: document.querySelector(".item-detail .other").value || '',
      host: document.querySelector(".item-detail .host").value || '',
      inputId1: document.querySelector(".item-detail .input-id1").value || '',
      inputId2: document.querySelector(".item-detail .input-id2").value || '',
    });
  }
  // 登录按钮 点击事件
  else if (e.target.getAttribute("data-action") == "login") {
    if(document.querySelector(".key").value)
      popUp.sendKey(document.querySelector(".key").value);
    document.querySelector(".login-page").style.display = "none";
  }
  // 添加按钮 点击事件
  else if (e.target.className == "title-add-item" || e.target.parentNode.className == "title-add-item") {
    popUp.enterDetailPage({
      id: new Date().getTime()
    });

  }
  // 后退按钮 点击事件
  else if (e.target.className == "title-back" || e.target.parentNode.className == "title-back") {
    popUp.outDetailPage();
  }
  // 数字按钮 点击事件
  else if (e.target.className == "record" || e.target.parentNode.className == "record") {
    // popUp.refreshItems();
    document.querySelector(".login-page").style.display = "flex";

  }


  // 删除按钮 点击事件
  else if (e.target.className == "trash" || e.target.parentNode.className == "trash") {
    popUp.deleteItem(document.querySelector(".item-detail .id").value);
  }
  // 插入按钮 点击事件
  else if (e.target.className && e.target.className.indexOf("button") >= 0 && e.target.className.indexOf("insert") >= 0) {
    dataId = e.target.getAttribute("data-id") || e.target.parentNode.getAttribute("data-id") || e.target.parentNode.parentNode.getAttribute("data-id");
    var code = "window.item='" + popUp.getItemJSONFromPopUp(dataId) + "';item=JSON.parse(item);";
    chrome.tabs.executeScript(null, {
      code: code,
      allFrames: true
    });
    // chrome.tabs.executeScript(null, {code: 'document.body.style.backgroundColor="red"',allFrames:true});
    chrome.tabs.executeScript(null, {
      file: "content_script.js",
      allFrames: true
    });
    window.close();
    return;
  }

  // 条目 点击事件
  if (e.target.getAttribute("data-id") || e.target.parentNode.getAttribute("data-id") || e.target.parentNode.parentNode.getAttribute("data-id")) {
    dataId = e.target.getAttribute("data-id") || e.target.parentNode.getAttribute("data-id") || e.target.parentNode.parentNode.getAttribute("data-id");
    var item = popUp.getItemFromPopUp(dataId);
    if(item){
      popUp.enterDetailPage(item);
    }
  }
  // window.close();

}
*/
