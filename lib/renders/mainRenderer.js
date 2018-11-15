const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');

$(document).on('click', '.run', (e) => {

  var run = $(e.currentTarget)
  /*var item = $($(e.currentTarget).parent());*/
  var key = run.attr('id');
  ipcRenderer.send('run', key);
  run.prop('disabled', true);
  run.html('<i class="fas rotating fa-sync-alt"></i>')

})

$(document).on('click', '.delete', (e) => {

  var item = $($(e.currentTarget).parent());
  var key = item.attr('key');

  ipcRenderer.send('delete', key);
  item.remove();
  if($("#profiles").is(":empty"))
    $("#profiles").append("<p class='centered'>No tasks found</p>")

})

ipcRenderer.on('closed', (event, id) => {

  var stop = $("#" + id);
  stop.prop('disabled', false);
  stop.html("<i class='fas run fa-play'></i>")

})

ipcRenderer.on('checkout_url', (event, stuff) => {

  console.log("eh beh che dire")
  window.open(stuff.url)

})

ipcRenderer.on('newItem', (event, item) => {

  if($("#profiles p").hasClass("centered")){

    $("#profiles p.centered").remove();

  }
  console.log(item)
  $("#profiles").append("<div class='item' key='"+item.id+"'><span class='run' id="+item.id+"><i class='fas run fa-play'></i></span><i class='fas delete fa-trash-alt'></i><i class='fas fa-edit'></i><span>" + item.task_name + "</span></div>")

})

ipcRenderer.on('config', (event, config) => {

  if(config.profiles.length == 0){

    $("#profiles").append("<p class='centered'>No tasks found</p>")

  }else{

    console.log(config)
    for(profile in config.profiles){

      $("#profiles").append("<div class='item' key="+config.profiles[profile].id+"><span id="+config.profiles[profile].id+" class='run'><i class='fas fa-play'></i></span><i class='fas delete fa-trash-alt'></i><i class='fas fa-edit'></i><span>" + config.profiles[profile].task_name + "</span></div>")

    }

  }

})

$("#openPaypal").click(() => {

  ipcRenderer.send('openPaypal')

})

$("#openCaptcha").click(() => {

  ipcRenderer.send('openCaptcha')

})

$("#openGoogle").click(() => {

  ipcRenderer.send('openGoogle')

})

$("#addtask").click(() => {

  ipcRenderer.send('openTaskWindow')

})
