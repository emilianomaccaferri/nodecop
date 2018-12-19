const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');

$(".size-picker").on('click', (e) => {

  $(".size-picker").not(e.currentTarget).removeClass("selected")
  $(e.currentTarget).addClass("selected")

})

$(".item-picker").on('click', (e) => {

  $(".item-picker").not(e.currentTarget).removeClass("selected")
  $(e.currentTarget).addClass("selected")

})

$(".picker").on('click', (e) => {

  $(".picker").not(e.currentTarget).removeClass("selected")
  $(e.currentTarget).addClass("selected")
  if($(e.currentTarget).attr('id') == 'item'){
    $("#i").animate({right: 0}, 500);
    $("#billing").animate({right: "-600px"}, 500)
  }else{
    $("#i").animate({right: "-600px"}, 500);
    $("#billing").animate({right: "0"}, 500)
  }

})
