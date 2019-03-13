const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');
const random = require('randomstring');

$("#create").on('click', (e) => {

  console.log("ciao");

  var itemType = $(".item-picker.selected").attr('value'),
      itemName = $("#task-item-name").val().trim(),
      itemColor = $("#task-item-color").val().trim(),
      itemSize = $(".size-picker.selected").attr('value'),
      taskId = random.generate(32),
      profileID = $("#profiles").val();

      console.log(profileID);

  if(!(itemType && itemName && itemColor && itemSize)){
        alert("Something is missing, every field is required!")
        return;
      }

  var item = {

    "task_name": itemName,
    "task_id": taskId,
    "item_type": itemType,
    "item_name": itemName,
    "item_color": itemColor,
    "item_size": itemSize,
    "profile_id": profileID

  }

  ipcRenderer.send('create-task', item);

})

$(".cc-picker").on('click', (e) => {

  $(".cc-picker").not(e.currentTarget).removeClass("selected");
  $(e.currentTarget).addClass("selected")
  var toggle = $(e.currentTarget).attr('value');
  switch(toggle){
    case 'cc':
      $(".paypal").hide();
      $(".cc").show();
    break;
    case 'paypal':
    $(".cc").hide();
    $(".paypal").show();
    break;
  }

})

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
    $("#i").animate({right: 0}, 500, () => {
      $("#billing").hide();
      $("#billing").animate({right: "-600px"}, 500)
    });
  }else{
    $("#i").animate({right: "-600px"}, 500);
    $("#billing").show();
    $("#billing").animate({right: "0"}, 500)
  }

})

ipcRenderer.on('profiles', (e, profiles) => {

  console.log(profiles);

  for(profile in profiles){

    $("#profiles").append(`<option value="${profile}"> ${profiles[profile].task_name} </option>"`)

  }

})
