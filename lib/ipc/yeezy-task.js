const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');
const random = require('randomstring');


$("#create").on('click', (e) => {

  var taskName = $("#task-name").val().trim(),
      name = $("#task-real").val().trim(),
      surname = $("#task-surname").val().trim(),
      address = $("#task-address").val().trim(),
      apt = $("#task-apt").val().trim(),
      city = $("#task-city").val().trim(),
      email = $("#task-email").val().trim(),
      country = $("#task-country").val().trim(),
      province = $("#task-province").val().trim(),
      zip = $("#task-zip").val().trim(),
      phone = $("#task-phone").val().trim(),
      cc = $("#task-cc").val().trim(),
      name_on_card = $("#task-name-cc").val().trim(),
      exp_month = $("#task-expiry").val().trim().split("/")[0],
      exp_year = $("#task-expiry").val().trim().split("/")[1],
      cvv = $("#task-cvv").val().trim(),
      yeezy = $("#task-item-name").val().trim(),
      yeezy_size = $(".size-picker.selected").attr('value');

  if(!(taskName && name && surname && address && city && email && country &&
      province && zip && phone && cc && name_on_card && exp_month && exp_year && cvv && yeezy && yeezy_size)){
        alert("Something is missing, every field is required!")
        return;
      }

  var item = {

    "task_name": taskName,
    "task_id": "yeezy-" + random.generate(32),
    "name": name,
    "email": email,
    "surname": surname,
    "address": address,
    "apt": apt,
    "city": city,
    "country": country,
    "province": province,
    "zip": zip,
    "phone": phone,
    "cc": cc,
    "name_on_card": name_on_card,
    "exp_month": exp_month,
    "exp_year": exp_year,
    "cvv": cvv,
    "yeezy": yeezy,
    "yeezy_size": yeezy_size

  }

  ipcRenderer.send('create-task-yeezy', item);

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
