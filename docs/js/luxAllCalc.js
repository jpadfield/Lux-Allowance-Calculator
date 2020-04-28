var types
var profiles
var diff
var days
var use
var profs
var newInputs = true;
var link

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var now = new Date()
var then = new Date(now)
then.setDate(now.getDate() + 6)

var vars = {'start':now, 'end':then, 'type':false,
	'prof':false,	'luxlevel':false, 'maintenanceLux':false,
	'overnightLux':false, 'maxLux':false, 'debug':false}

for (var key in vars)
	{if (urlParams.has(key))
		{if (key == "start" || key == "end")
			{vars[key] = new Date(urlParams.get(key) + "T00:00")}
		 else
			{vars[key] = urlParams.get(key)}}}

var dayLuxTotals = {	
	sunday:0,
	monday:0,
	tuesday:0,
	wednesday:0,
	thursday:0,
	friday:0,
	saturday:0
	};

const dayNames = Object.keys(dayLuxTotals);

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

function showDebug(str)
	{if (vars["debug"])
		{console.log("DEBUG");
		 console.log(str);}}
	
function validateValues (inputID, str)
	{
	var cInput = document.getElementById(inputID);
	cInput.value = str;
	}

// From: https://www.freecodecamp.org/forum/t/how-to-capitalize-the-first-letter-of-a-string-in-javascript/18405
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function luxUpdate (inputID)
	{var cInput = document.getElementById(inputID);
	 vars[inputID] = parseInt(cInput.value);
	 luxValidate (inputID);	
	 calculateAllowance()}

function luxValidate (inputID)
	{
	var inputLU = document.getElementById(inputID);
	$(inputLU).removeClass("alert-success alert-danger alert-warning");
	
	if (vars[inputID] === false || vars[inputID] == use[inputID])
		{vars[inputID] = parseInt(use[inputID]);}
	else if (vars[inputID] > vars['maxLux'])
		{showDebug (inputID + " limited to the value of maxLux: "+vars['maxLux']);
		 vars[inputID] = parseInt(vars['maxLux']);
		 $(inputLU).addClass("alert alert-danger");}
	else
		{$(inputLU).addClass("alert alert-warning");}	
	inputLU.value = vars[inputID];
	}
	
function typeUpdate()
	{
	vars["type"] = document.getElementById("type").value
	use = types[vars["type"]]
	vars['maxLux'] = parseInt(use['maxLux']);
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
		 validateValues ("start", getDateStr(vars["start"]))}
	if (vars["end"] == "Invalid Date")
		{vars["end"] = then;
		 validateValues ("end", getDateStr(vars["end"]))}

	calculateAllowance()
	}
	
function populateInputs()
	{
	var inputStart = document.getElementById("start");
	var inputEnd = document.getElementById("end");
	var selectType = document.getElementById("type");
	var selectProf = document.getElementById("prof");
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

	inputStart.value = getDateStr(vars["start"])
	inputEnd.value = getDateStr(vars["end"])
     
  if (typeof types[vars["type"]] == 'undefined') {		
		vars["type"] = Object.keys(types)[0];}
	selectType.value = vars["type"];

	var displayDetails = document.getElementById('typeComment');
	displayDetails.innerHTML = types[vars["type"]]["comment"];	
       
  if (typeof profiles[vars["prof"]] == 'undefined') {
		vars["prof"] = Object.keys(profiles)[0];}
	selectProf.value = vars["prof"];

	use = types[vars["type"]]
	prof = profiles[vars["prof"]];

	var str = "";

	for (var key in prof)
		{
		var ca = prof[key]
		
		if (key !== "default")
			{str = str + "<br/>&nbsp;&nbsp;&nbsp;&nbsp; + " + capitalizeFirstLetter(key) + ": open for "+ ca["openingHours"] + " hrs , plus an extra " + ca["maintenance"] + " hrs"}
		else
			{str = str + "Open for " + ca["openingHours"] + " hrs a day, with an extra " + ca["maintenance"] + " hrs for cleaning, maintenance and security activities"}
		}

	displayDetails = document.getElementById('profileDetails');
	displayDetails.innerHTML = str;
		
	if (!vars['maxLux'])
		{vars['maxLux'] = parseInt(use['maxLux']);}
		
	if (!vars['annual'])
		{vars['annual'] = parseInt(use['annual']);}
	inputAN.value = vars['annual'];

	luxValidate ('luxlevel');
	luxValidate ('maintenanceLux');
	luxValidate ('overnightLux');

	calculateAllowance()
	}

function dayLuxTotal (cday)
	{
	// vars and prof are global variables

	if (typeof prof[cday] !== 'undefined') {var cp = prof[cday]}
	else	{var cp = prof["default"]}

	var dtotal =
		(vars["luxlevel"] * cp["openingHours"]) + // Standard opening times for this day
		(vars['maintenanceLux'] * cp["maintenance"]) + // Opening for cleaning and or security checks
		(vars['overnightLux'] * (24 - cp["openingHours"] - cp["maintenance"])); //overnight light levels

	dayLuxTotals[cday] = dtotal
	return (dtotal)
	}
	
function calculateAllowance()
		{
		showDebug("calculateAllowance")
		showDebug(vars)
		showDebug(prof)
		
		// Formulate the Difference between two dates 
		diff = (vars["end"] - vars["start"])/1000; // return seconds
		days = Math.floor(diff / (60*60*24)) + 1;
		var allowance = Math.floor(use["annual"] * (days/365));

		var t0 = performance.now()
		
		fullWeeks = Math.floor(days / 7);
		remainder = days - (fullWeeks * 7);

		var cluxvals = {}
		var weekLuxTotal = 0;
		
		dayNames.forEach(function (item, index) {
			weekLuxTotal = weekLuxTotal + dayLuxTotal (item);
			});

		showDebug(dayLuxTotals)
		showDebug("weekLuxTotal: " + weekLuxTotal)
		showDebug("days: " + days)
		showDebug("fullWeeks: " + fullWeeks)
		showDebug("remainder: " + remainder)
		var dn = 0
		var luxTotal = weekLuxTotal * fullWeeks
		showDebug("luxTotal (from full weeks) = " + weekLuxTotal + " * " + fullWeeks + " = " + luxTotal)
		
		while (dn < remainder)
			{const tcd = new Date(vars["start"])
			 const tcurrentDate = vars["start"].getDate()
			 tcd.setDate(vars["start"].getDate() + dn)
			 dayOfWeek = dayNames[tcd.getDay()]
			 luxTotal = luxTotal + dayLuxTotals[dayOfWeek]
			 showDebug("luxTotal (+ "+dayLuxTotals[dayOfWeek]+" for " +dayOfWeek+" ) = " + luxTotal)			
			 dn++}		

    dn = 0
		
		var resultsDetails = document.getElementById('result');
		$(resultsDetails).removeClass("alert-success alert-danger");
		
		remainder = Math.floor (allowance - luxTotal)

		var resultStr = "Exhibition (" + days + " days): Allowance: " + allowance + " Lux Hrs<br/>"
				
		if (remainder >= 0)
			{
			if (vars["luxlevel"] > 0)
				{var useLux = vars["luxlevel"];}
			else
				{var useLux = parseInt(use["luxlevel"]);}
		
			resultStr = resultStr + "Allocated: " + luxTotal + " Lux Hrs - this leaves "+ remainder +" Lux Hrs "+
				" to use for additional events." +
				"<br/>&nbsp;&nbsp;&nbsp;&nbsp;@ "+useLux+" lux this allows " +(remainder/useLux).toFixed(2)+ " hrs of exposure"+
				"<br/>&nbsp;&nbsp;&nbsp;&nbsp;@ "+(useLux*0.6).toFixed(0)+" lux (60%) this allows " +(remainder/(useLux*0.6)).toFixed(2)+ " hrs of exposure"+
				"<br/>&nbsp;&nbsp;&nbsp;&nbsp;@ "+(useLux*0.4).toFixed(0)+" lux (40%) this allows " +(remainder/(useLux*0.4)).toFixed(2)+ " hrs of exposure";
			 $(resultsDetails).addClass("alert-success");}
		else
			{resultStr = resultStr + "Allocated: " + luxTotal + " Lux Hrs<br/>CAUTION - OVEREXPOSURE BY: " + (remainder * -1) + " Lux Hrs<br/>";
			 $(resultsDetails).addClass("alert-danger");}

		link = "?"
		for (var key in vars)
			{			
			if (key == "start" || key == "end")
				{link = link + key+"="+getDateStr(vars[key])+"&"}
			else
				{link = link + key+"="+vars[key]+"&"}
			}

		document.getElementById('linkButton').href = link

		resultsDetails.innerHTML = resultStr;
		}

function getDateStr(dateVal)
	{
	var mn = pad((dateVal.getMonth() + 1),2)
	var dn = pad(dateVal.getDate(),2)

	var str = dateVal.getFullYear() + "-" +	mn + "-" + dn

	return(str)
	}
	
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
