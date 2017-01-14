$(document).ready(function(){
  $('.ui.checkbox').checkbox();
  $('[name=wilddog]').val(localStorage.url || '');
  $('[type=password]').val(localStorage.privateKey || '');

  $('[name=wilddog]').on('input',function(){
    var a = $(this).val().replace(/^https?:\/\//ig,'');
    a = (a != $(this).val()) ? $(this).val(a) : null;
  });

  $('.button.positive').on('click',function(){
    localStorage.url = $('[name=wilddog]').val();
    localStorage.privateKey = $('[type=password]').val();
    // console.log($('[name=remember]').parent().hasClass('checked'));
  });
});
