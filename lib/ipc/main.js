const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');

$("#exit").click(() => {

  ipcRenderer.send('close')

})

$("#captcha-harvest").click(() => {

  ipcRenderer.send('trainer')

})

$(document).on('click', '.stop', (e) => {

  var el = $(e.currentTarget);
  var parent = el.parent();
  var t = parent.text();
  var id = el.attr('play-id');

  $(parent).html(`

      <div class="task" id="${id}" style="margin-left: 0;"> <i class="far fa-square sel" select-id="${id}"></i> <i class="far fa-trash-alt del" del-id="${id}"></i> <i class="fas fa-play play" style="margin-right: 10px;" play-id="${id}"></i> ${t} <span class="status"></span> </div>

    `)

  ipcRenderer.send('stop-task', id)

})

$(document).on('click', '.play', (e) => {

  var el = $(e.currentTarget);
  var id = el.attr('play-id');
  el.removeClass("fa-play")
  el.addClass("fa-square")
  el.addClass("stop");

  ipcRenderer.send('run-task', id)

})

$(document).on('click', '.del', (e) => {

  var el = $(e.currentTarget);
  el.parent().remove();
  if($(".task").length == 0)
    $(".task-list").html(`<p class="announce"> No tasks available, create a new one by clicking on the "+" icon </p>`)

  ipcRenderer.send('remove-task', item)

})

$(document).on('click', '.sel', (e) => {

  var el = $(e.currentTarget);
  if(!el.hasClass("checked")){
    el.addClass("checked");
    el.addClass("fas");
    el.removeClass("fa-square");
    el.addClass("fa-check-square");
    el.css({color: "#4b7bec"})

    return;
  }

  el.css({color: "black"})
  el.removeClass("checked");
  el.removeClass("fas");
  el.removeClass("fa-check-square");
  el.addClass("fa-square");

})

ipcRenderer.on('config', (event, config) => {

  if(Object.keys(config).length == 0)
    return;

  $(".task-list").empty();

  for(item in config){
    $(".task-list").prepend(`

        <div class="task" id="${item.task_id}"> <i class="far fa-square sel" select-id="${item.task_id}"></i> <i class="far fa-trash-alt del" del-id="${config[item].task_id}"></i> <i class="fas fa-play play" style="margin-right: 10px;" play-id="${config[item].task_id}"></i> ${config[item].task_name} <span class="status"></span> </div>

      `)

  }

})

ipcRenderer.on('task-update', (event, item) => {

  if($(".task").length == 0)
    $(".task-list").empty();

  $(".task-list").prepend(`

      <div class="task" id="${item.task_id}"> <i class="far fa-square sel" select-id="${item.task_id}"></i> <i class="far fa-trash-alt del" del-id="${item.task_id}"></i> <i class="fas fa-play play" style="margin-right: 10px;" play-id="${item.task_id}"></i> ${item.task_name} <span class="status"></span> </div>

    `)

})

$("#new").on('click', (e) => {

  ipcRenderer.send('new-task')

})

$("#new-yzy").on('click', (e) => {

  ipcRenderer.send('new-task-yeezy')

})

$("#g-login").on('click', (e) => {

  ipcRenderer.send('google-login')

})
