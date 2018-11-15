const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');

$("#timer-refresh-delay").css({opacity: 0.5});
$("#timer-refresh-delay").prop('disabled', true);


$("#complete").click(() => {

  var task_name = $("#taskName").val().trim(),
      billing_name = $("#name").val().trim(),
      email = $("#email").val().trim(),
      color = $("#color").val().trim(),
      telephone = $("#tel").val().trim(),
      city = $("#city").val().trim(),
      credit = $("#cc").val().trim(),
      country = $("#country").val().trim(),
      expiry_month = $("#expiry_month").val().trim(),
      expiry_year = $("#expiry_year").val().trim(),
      item_name = $("#item_name").val().trim(),
      size = $("#size").val(),
      type = $("#type").val(),
      refresh = $("#refresh").attr('value'),
      refresh_timer = $("#timer-refresh-delay").val(),
      auto_checkout = $("#checkout").attr('value'),
      zip = $("#zip").val().trim(),
      address = $("#address").val().trim();

    var toPush = {

      "task_name": task_name,
      "billing_name": billing_name,
      "zipCode": zip,
      "color": color,
      "email": email,
      "telephone": telephone,
      "city": city,
      "cc": credit,
      "country": country,
      "expiry_month": expiry_month,
      "expiry_year": expiry_year,
      "item_name": item_name,
      "size": size,
      "type": type,
      "refresh": refresh,
      "refresh_timer": refresh_timer,
      "auto_checkout": auto_checkout

    }

    ipcRenderer.send('new', toPush);
    remote.getGlobal('mainWindow').send('newItem', toPush)

})

$("#settings").click(() => {

  $("#info").fadeOut(200, () => {

    $("#set").fadeIn().css({"position": "relative"});

  });

})

$("#informations").click(() => {

  $("#set").fadeOut(200, () => {

    $("#info").fadeIn();

  });

})

$("#checkout").click(() => {

  if($("#checkout").hasClass("enabled")){

    $("#checkout").removeClass("enabled");
    $("#checkout").html("Auto-checkout disabled")
    $("#checkout").attr('value', false)

  }else{

    $("#checkout").addClass("enabled");
    $("#checkout").html("Auto-checkout enabled")
    $("#checkout").attr('value', true)

  }

})

$("#refresh").click(() => {

  if($("#refresh").hasClass("enabled")){

    $("#refresh").removeClass("enabled");
    $("#refresh").html("Refresh timer disabled")
    $("#refresh").attr('value', false)
    $("#timer-refresh-delay").css({opacity: 0.5});
    $("#timer-refresh-delay").prop('disabled', true);

  }else{

    $("#refresh").addClass("enabled");
    $("#refresh").html("Refresh timer enabled")
    $("#refresh").attr('value', true)
    $("#timer-refresh-delay").css({opacity: 1});
    $("#timer-refresh-delay").prop('disabled', false);

  }

})
