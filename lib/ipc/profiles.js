const remote = require('electron').remote
const app = remote.app
const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');
const random = require('randomstring');
const  countries = {AF:"Afghanistan",AX:"Aland Islands",AL:"Albania",DZ:"Algeria",AS:"American Samoa",AD:"Andorra",AO:"Angola",AI:"Anguilla",AQ:"Antarctica",AG:"Antigua And Barbuda",AR:"Argentina",AM:"Armenia",AW:"Aruba",AU:"Australia",AT:"Austria",AZ:"Azerbaijan",BS:"Bahamas",BH:"Bahrain",BD:"Bangladesh",BB:"Barbados",BY:"Belarus",BE:"Belgium",BZ:"Belize",BJ:"Benin",BM:"Bermuda",BT:"Bhutan",BO:"Bolivia",BA:"Bosnia And Herzegovina",BW:"Botswana",BV:"Bouvet Island",BR:"Brazil",IO:"British Indian Ocean Territory",BN:"Brunei Darussalam",BG:"Bulgaria",BF:"Burkina Faso",BI:"Burundi",KH:"Cambodia",CM:"Cameroon",CA:"Canada",CV:"Cape Verde",KY:"Cayman Islands",CF:"Central African Republic",TD:"Chad",CL:"Chile",CN:"China",CX:"Christmas Island",CC:"Cocos (Keeling) Islands",CO:"Colombia",KM:"Comoros",CG:"Congo",CD:"Congo, Democratic Republic",CK:"Cook Islands",CR:"Costa Rica",CI:"Cote D'Ivoire",HR:"Croatia",CU:"Cuba",CY:"Cyprus",CZ:"Czech Republic",DK:"Denmark",DJ:"Djibouti",DM:"Dominica",DO:"Dominican Republic",EC:"Ecuador",EG:"Egypt",SV:"El Salvador",GQ:"Equatorial Guinea",ER:"Eritrea",EE:"Estonia",ET:"Ethiopia",FK:"Falkland Islands (Malvinas)",FO:"Faroe Islands",FJ:"Fiji",FI:"Finland",FR:"France",GF:"French Guiana",PF:"French Polynesia",TF:"French Southern Territories",GA:"Gabon",GM:"Gambia",GE:"Georgia",DE:"Germany",GH:"Ghana",GI:"Gibraltar",GR:"Greece",GL:"Greenland",GD:"Grenada",GP:"Guadeloupe",GU:"Guam",GT:"Guatemala",GG:"Guernsey",GN:"Guinea",GW:"Guinea-Bissau",GY:"Guyana",HT:"Haiti",HM:"Heard Island & Mcdonald Islands",VA:"Holy See (Vatican City State)",HN:"Honduras",HK:"Hong Kong",HU:"Hungary",IS:"Iceland",IN:"India",ID:"Indonesia",IR:"Iran, Islamic Republic Of",IQ:"Iraq",IE:"Ireland",IM:"Isle Of Man",IL:"Israel",IT:"Italy",JM:"Jamaica",JP:"Japan",JE:"Jersey",JO:"Jordan",KZ:"Kazakhstan",KE:"Kenya",KI:"Kiribati",KR:"Korea",KW:"Kuwait",KG:"Kyrgyzstan",LA:"Lao People's Democratic Republic",LV:"Latvia",LB:"Lebanon",LS:"Lesotho",LR:"Liberia",LY:"Libyan Arab Jamahiriya",LI:"Liechtenstein",LT:"Lithuania",LU:"Luxembourg",MO:"Macao",MK:"Macedonia",MG:"Madagascar",MW:"Malawi",MY:"Malaysia",MV:"Maldives",ML:"Mali",MT:"Malta",MH:"Marshall Islands",MQ:"Martinique",MR:"Mauritania",MU:"Mauritius",YT:"Mayotte",MX:"Mexico",FM:"Micronesia, Federated States Of",MD:"Moldova",MC:"Monaco",MN:"Mongolia",ME:"Montenegro",MS:"Montserrat",MA:"Morocco",MZ:"Mozambique",MM:"Myanmar",NA:"Namibia",NR:"Nauru",NP:"Nepal",NL:"Netherlands",AN:"Netherlands Antilles",NC:"New Caledonia",NZ:"New Zealand",NI:"Nicaragua",NE:"Niger",NG:"Nigeria",NU:"Niue",NF:"Norfolk Island",MP:"Northern Mariana Islands",NO:"Norway",OM:"Oman",PK:"Pakistan",PW:"Palau",PS:"Palestinian Territory, Occupied",PA:"Panama",PG:"Papua New Guinea",PY:"Paraguay",PE:"Peru",PH:"Philippines",PN:"Pitcairn",PL:"Poland",PT:"Portugal",PR:"Puerto Rico",QA:"Qatar",RE:"Reunion",RO:"Romania",RU:"Russian Federation",RW:"Rwanda",BL:"Saint Barthelemy",SH:"Saint Helena",KN:"Saint Kitts And Nevis",LC:"Saint Lucia",MF:"Saint Martin",PM:"Saint Pierre And Miquelon",VC:"Saint Vincent And Grenadines",WS:"Samoa",SM:"San Marino",ST:"Sao Tome And Principe",SA:"Saudi Arabia",SN:"Senegal",RS:"Serbia",SC:"Seychelles",SL:"Sierra Leone",SG:"Singapore",SK:"Slovakia",SI:"Slovenia",SB:"Solomon Islands",SO:"Somalia",ZA:"South Africa",GS:"South Georgia And Sandwich Isl.",ES:"Spain",LK:"Sri Lanka",SD:"Sudan",SR:"Suriname",SJ:"Svalbard And Jan Mayen",SZ:"Swaziland",SE:"Sweden",CH:"Switzerland",SY:"Syrian Arab Republic",TW:"Taiwan",TJ:"Tajikistan",TZ:"Tanzania",TH:"Thailand",TL:"Timor-Leste",TG:"Togo",TK:"Tokelau",TO:"Tonga",TT:"Trinidad And Tobago",TN:"Tunisia",TR:"Turkey",TM:"Turkmenistan",TC:"Turks And Caicos Islands",TV:"Tuvalu",UG:"Uganda",UA:"Ukraine",AE:"United Arab Emirates",GB:"United Kingdom",US:"United States",UM:"United States Outlying Islands",UY:"Uruguay",UZ:"Uzbekistan",VU:"Vanuatu",VE:"Venezuela",VN:"Viet Nam",VG:"Virgin Islands, British",VI:"Virgin Islands, U.S.",WF:"Wallis And Futuna",EH:"Western Sahara",YE:"Yemen",ZM:"Zambia",ZW:"Zimbabwe"};

$("#create").on('click', (e) => {

  console.log("ciao");

  var billingName = $("#task-billing-name").val().trim(),
      billingEmail = $("#task-email").val().trim(),
      billingTelephone = $("#task-telephone").val().trim(),
      billingCity = $("#task-city").val().trim(),
      billingAddress = $("#task-address").val().trim(),
      billingZip = $("#task-zip-code").val().trim(),
      billingCountry = $("#task-country").val().trim(),
      taskId = random.generate(32),
      taskName = $("#task-name").val().trim(),
      ccType = $(".cc-picker.selected").attr('value'),
      cnb = $("#task-cc-number").val().trim(),
      vval = $("#task-cc-cvv").val().trim(),
      month = $("#task-cc-expiry").val().trim().split("/")[0],
      year = $("#task-cc-expiry").val().trim().split("/")[1],
      countryCode = Object.keys(countries).find(key => countries[key] === billingCountry);

      console.log(countryCode);

  if(!(taskName && billingName && billingEmail && billingTelephone && billingCity && billingAddress && billingZip && billingCountry && ccType)){
        alert("Something is missing, every field is required!")
        return;
      }

  var item = {

    "profile_id": taskId,
    "task_name": taskName,
    "name": billingName,
    "email": billingEmail,
    "telephone": billingTelephone,
    "city": billingCity,
    "address": billingAddress,
    "zip": billingZip,
    "country": countryCode
  }

  if(ccType === 'paypal'){
    var month = + new Date().getMonth() + 1;
    var dummy = "";
    if(month <= 9) dummy = "0" + month
    item["credit_card[type]"] = "paypal"
    item["credit_card[month]"] = dummy
    item["credit_card[year]"] = new Date().getFullYear()
  }
  else{
    if(!(cnb && month && year && vval)){
      alert("Something is missing in your card info")
      return;
    }
    item["credit_card[type]"] = ccType
    item["credit_card[cnb]"] = cnb
    item["credit_card[month]"] = month
    item["credit_card[year]"] = year
    item["credit_card[vval]"] = vval
  }

  ipcRenderer.send('create-profile', item);

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

  for(profile in profiles){

    var c = profiles[profile];
    $("#profiles").append(`<div> ${c.task_name} </div>`)

  }

})

ipcRenderer.on('profile-update', (e, profile) => {

  $("#profiles").append(`<div> ${profile.profile_name} </div>`)

})
