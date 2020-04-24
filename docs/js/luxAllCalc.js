var processData = false

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Check if any data has actually been passed to the page
const urlParamCount = Array.from(urlParams).length;
if (urlParamCount) {processData = true}

var now = new Date()
var then = new Date(now)
then.setDate(now.getDate() + 6)

var vars = {'start':now, 'end':then, 'type':"Stable artworks",
	'prof':"NG Standard",	'openingHours':false, 'openingMaintenance':false,
	'luxlevel':false, 'maintenancelevel':false, 'overnightlevel':false}

for (var key in vars)
	{if (urlParams.has(key))
		{vars[key] = urlParams.get(key)}}
			
var types
var profiles
var diff
var days
var use
var profs

var newInputs = true;

const dayNames = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday'
	]

function buildDropdowns () {
		// ------------------------------------------------------- //
		// Multi Level dropdowns
		// ------------------------------------------------------ //
		$("ul.dropdown-menu [data-toggle='dropdown']").on("click", function(event) {
			event.preventDefault();
			event.stopPropagation();

			$(this).siblings().toggleClass("show");

			if (!$(this).next().hasClass('show')) {
				$(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
				}
			$(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
				$('.dropdown-submenu .show').removeClass("show");
				});
			});
		}
		
function validateValues (inputID, str)
	{
	var cInput = document.getElementById(inputID);
	cInput.value = str;
	}

// From: https://www.freecodecamp.org/forum/t/how-to-capitalize-the-first-letter-of-a-string-in-javascript/18405
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function varUpdate (inputID)
	{
	var cInput = document.getElementById(inputID);
	$(cInput).addClass("alert alert-warning");
	vars[inputID] = parseInt(cInput.value);
	calculateAllowance()
	}
	
function typeUpdate()
	{
	vars["type"] = document.getElementById("type").value
	use = types[vars["type"]]
	vars['annual'] = parseInt(use['annual']);
	vars['luxlevel'] = parseInt(use['luxlevel']);
	$(".form-control").removeClass("alert alert-warning");
	vars['maintenanceLux'] = parseInt(use['maintenanceLux']);
	vars['overnightLux'] = parseInt(use['overnightLux']);
	populateInputs()
	}

function profUpdate()
	{
	vars["prof"] = document.getElementById("prof").value
	prof = profiles[vars["prof"]];
	populateInputs()
	}

function dateUpdate()
	{
	var startStr = document.getElementById("start").value
	vars["start"] = new Date(startStr+"T00:00")
	var endStr = document.getElementById("end").value
	vars["end"] = new Date(endStr+"T00:00")
	
	if (vars["start"] == "Invalid Date")
		{vars["start"] = now;
		 validateValues ("start", vars["start"].getFullYear() + "-" +
			(vars["start"].getMonth() + 1) + "-" + vars["start"].getDate())}
	if (vars["end"] == "Invalid Date")
		{vars["end"] = then;
		 validateValues ("end", vars["end"].getFullYear() + "-" +
			(vars["end"].getMonth() + 1) + "-" + vars["end"].getDate())}

	calculateAllowance()
	}
	
function populateInputs()
	{
	var inputStart = document.getElementById("start");
	var inputEnd = document.getElementById("end");
	var selectType = document.getElementById("type");
	var selectProf = document.getElementById("prof");
	var inputLL = document.getElementById('luxlevel');
	var inputBL = document.getElementById('maintenanceLux');
	var inputOL = document.getElementById('overnightLux');
	var inputAN = document.getElementById('annual');

	if (newInputs) {
		for (var key in types)
			{var el = document.createElement("option"); 
			 el.textContent = key; 
			 el.value = key; 
			 selectType.appendChild(el);}
		for (var key in profiles)
			{var el = document.createElement("option"); 
			 el.textContent = key; 
			 el.value = key; 
			 selectProf.appendChild(el);}
		newInputs = false;}

	inputStart.value = vars["start"].getFullYear() + "-" +
		(vars["start"].getMonth() + 1) + "-" + vars["start"].getDate()
	inputEnd.value = vars["end"].getFullYear() + "-" +
		(vars["end"].getMonth() + 1) + "-" + vars["end"].getDate()
     
  if (typeof types[vars["type"]] == 'undefined') {		
		vars["type"] = Object.keys(types)[0];}
	selectType.value = vars["type"];

	var displayDetails = document.getElementById('typeComment');
	displayDetails.innerHTML = types[vars["type"]]["comment"];	
       
  if (typeof profiles[vars["prof"]] == 'undefined') {
		vars["prof"] = Object.keys(profiles)[0];}
	selectProf.value = vars["prof"];

	var str = "";

	for (var key in prof)
		{
		var ca = prof[key]
		
		if (key !== "default")
			{str = str + "<br/>&nbsp;&nbsp;&nbsp;&nbsp; + " + capitalizeFirstLetter(key) + ": open for "+ ca["openingHours"] + " hrs , plus an extra " + ca["maintenance"] + " hrs"}
		else
			{str = str + "Open for " + ca["openingHours"] + " hrs a day, with an extra " + ca["maintenance"] + " hrs for cleaning and security activities"}
		}

	displayDetails = document.getElementById('profileDetails');
	displayDetails.innerHTML = str;

	if (!vars['luxlevel'])
		{vars['luxlevel'] = parseInt(use['luxlevel']);}
	inputLL.value = vars['luxlevel'];
	
	if (!vars['annual'])
		{vars['annual'] = parseInt(use['annual']);}
	inputAN.value = vars['annual'];
	
	if (!vars['maintenanceLux'])
		{vars['maintenanceLux'] = parseInt(use['maintenanceLux']);}
	inputBL.value = vars['maintenanceLux'];
	
	if (!vars['overnightLux'])
		{vars['overnightLux'] = parseInt(use['overnightLux']);}
	inputOL.value = vars['overnightLux'];

	calculateAllowance()
	}

	
function calculateAllowance()
		{
		//console.log("calculateAllowance()");
		
		// Formulate the Difference between two dates 
		diff = (vars["end"] - vars["start"])/1000; // return seconds
		days = Math.floor(diff / (60*60*24)) + 1;
		fullWeeks = Math.floor(days / 7);
		remainder = days - (fullWeeks * 7);
		console.log("Days: " + days + " - Weeks: " +fullWeeks)
		var dn = 0
		
		while (dn < remainder)
			{
			const tcd = new Date(vars["start"])
			const tcurrentDate = vars["start"].getDate()
			tcd.setDate(vars["start"].getDate() + dn)
			dayOfWeek = dayNames[tcd.getDay()]
			console.log(dayOfWeek)
			dn++
			}		
		
		var allowance = Math.floor(use["annual"] * (days/365));

    dn = 0
    var luxTotal = 0

    while (dn < days)
			{
			const cd = new Date(vars["start"])
			const currentDate = vars["start"].getDate()
			cd.setDate(vars["start"].getDate() + dn)
			dayOfWeek = dayNames[cd.getDay()]

			if (typeof prof[dayOfWeek] !== 'undefined') {
				var cp = prof[dayOfWeek]
				}
			else	{
				var cp = prof["default"]
				}
			
			if (vars["luxlevel"]) {var ll = vars["luxlevel"]}
			else	{var ll = use["ave"]}
			
			luxTotal = luxTotal +
				(vars["luxlevel"] * cp["openingHours"]) + // Standard opening times for this day
				(vars['maintenanceLux'] * cp["maintenance"]) + // Opening for cleaning and or security checks
				(vars['overnightLux'] * (24 - cp["openingHours"] - cp["maintenance"])); //overnight light levels

			dn++;
			}

		var resultsDetails = document.getElementById('result');
		$(resultsDetails).removeClass("alert-success alert-danger");
		
		remainder = Math.floor (allowance - luxTotal)

		var tag = "Exhibition (" + days + " days): Allowance: " + allowance + " Lux Hrs<br/>"
				
		if (remainder >= 0)
			{tag = tag + "Allocated: " + luxTotal + " Lux Hrs - this leaves "+ remainder +" Lux Hrs "+
				" (" +(remainder/vars["luxlevel"]).toFixed(2)+ " hrs @ "+vars["luxlevel"]+"lux) to use for additional events.<br/>";
			 $(resultsDetails).addClass("alert-success");}
		else
			{tag = tag + "Allocated: " + luxTotal + " Lux Hrs<br/>CAUTION - OVEREXPOSURE BY: " + (remainder * -1) + " Lux Hrs<br/>";
			 $(resultsDetails).addClass("alert-danger");}
		
		resultsDetails.innerHTML = tag;
		}
