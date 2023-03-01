var types
var profiles
var diff
var days
var use
var profs
var newInputs = true;
var link
var urlParams

var typeDefault = false;
var profileDefault = false;

var extraProfiles;
var extraTypes;

var now = new Date()
//console.log(now);
var then = new Date(now)
then.setDate(now.getDate() + 6)

var ie11 = false;
var ua = window.navigator.userAgent;
var trident = ua.indexOf('Trident/');
if (trident > 0) {ie11 = true;}

const queryString = window.location.search;

var vars = {'start':now, 'end':then, 'type':false,
	'prof':false,	'luxlevel':false, 'maintenanceLux':false,
	'overnightLux':false, 'maxLux':false, 'minLux':false, 'period':false, 
	'url': false, 'debug':false, "annual":false, "data":false,
  "custom":false}
  
var tmpVars = vars;

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

function showDebug(str, label=false)
	{if (vars["debug"])
		{if (label) {console.log("DEBUG: " + label);}
     else {console.log("DEBUG");}
		 if (str) {console.log(str);}}}
	
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
   
function luxMMUpdate (inputID)
	{
  var cInput = document.getElementById(inputID);
	vars[inputID] = parseInt(cInput.value);	
  
  let mi = parseInt($("#minLux")[0].value);
  let ma = parseInt($("#maxLux")[0].value);
     
  if (mi < 0 ) {vars["minLux"] = 0;}     
  if (ma < 0 ) {vars["maxLux"] = 10;}    
  if (ma <= mi ) {vars["maxLux"] = mi + 10;}
  
  let clux = vars["luxlevel"]
      
  populateInputs();
  }
   

function otherUpdate (inputID, min=1, max=100, isInt=false)
	{var cInput = document.getElementById(inputID);
	 if (isInt) {vars[inputID] = parseInt(cInput.value);}
	 else {vars[inputID] = parseFloat(cInput.value);}
	 otherValidate (inputID, min, max);	
	 calculateAllowance()}

function luxValidate (inputID)
	{
  //showDebug (false, "luxValidate: "+ inputID)
	var inputLU = document.getElementById(inputID);
	$(inputLU).removeClass("alert-success alert-danger alert-warning");
	  
	if (vars[inputID] === false)
		{showDebug (inputID + " false so reset");
     vars[inputID] = parseInt(use[inputID]);}
	else if (vars[inputID] < 0)
		{showDebug (inputID + " limited to positive values");
		 vars[inputID] = 0;
		 $(inputLU).addClass("alert alert-danger");}
	else if (vars[inputID] > vars['maxLux'] && inputID != "annual")
		{showDebug (inputID + " limited to the value of maxLux: "+vars['maxLux']);
		 vars[inputID] = parseInt(vars['maxLux']);
		 $(inputLU).addClass("alert alert-danger");}
	else if (vars[inputID] < vars['minLux'] && inputID == "luxlevel")
		{showDebug (inputID + " limited to the value of minLux: "+vars['minLux']);
		 vars[inputID] = parseInt(vars['minLux']);
		 $(inputLU).addClass("alert alert-danger");}  
  else if (vars[inputID] == use[inputID])
		{showDebug (inputID + " no change");}
	else
		{showDebug (inputID + " changed");
     $(inputLU).addClass("alert alert-warning");}	
   
	inputLU.value = vars[inputID];
	}
  
function otherValidate (inputID, min, max, isInt=false)
	{
	var inputLU = document.getElementById(inputID);
	$(inputLU).removeClass("alert-success alert-danger alert-warning");
	
	if (vars[inputID] === false || vars[inputID] == use[inputID])
		{vars[inputID] = use[inputID];}
	else if (vars[inputID] > max)
		{showDebug (inputID + " limited to the value of "+ max);
		 vars[inputID] = max;
		 $(inputLU).addClass("alert alert-danger");}
	else if (vars[inputID] <  min)
		{showDebug (inputID + " must be greater than "+ min);
		 vars[inputID] = min;
		 $(inputLU).addClass("alert alert-danger");}
	else
		{$(inputLU).addClass("alert alert-warning");}
    
  if (isInt) {vars[inputID] = parseInt(vars[inputID]);}
  else {vars[inputID] = parseFloat(vars[inputID]);}
  
	inputLU.value = vars[inputID];
	}
	
function typeUpdate(which=false)
	{  
  //console.log("typeUpdate ("+which+"): " + vars["type"] + " -- " + document.getElementById("type").value)
	vars["type"] = document.getElementById("type").value
	use = types[vars["type"]]
	vars['maxLux'] = parseInt(use['maxLux']);
	vars['minLux'] = parseInt(use['minLux']);
	vars['annual'] = parseInt(use['annual']);
	vars['luxlevel'] = parseInt(use['luxlevel']);
	$(".form-control").removeClass("alert alert-warning");
	vars['maintenanceLux'] = parseInt(use['maintenanceLux']);
	vars['overnightLux'] = parseInt(use['overnightLux']);
	vars['period'] = parseInt(use['period']);
	populateInputs()
	}

function profUpdate()
	{
  //console.log("profUpdate: " + vars["prof"] + " -- " + document.getElementById("prof").value)
  
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
  
  
	var inputMax = document.getElementById('maxLux');
	var inputMin = document.getElementById('minLux');
  		
	if (newInputs) {    
    var customProfile = false;
		for (var key in types)
			{
       if (types[key].hasOwnProperty("selected"))
          {if(types[key]["selected"])
            {typeDefault = key;}}
       var el = document.createElement("option"); 
			 el.textContent = key; 
			 el.value = key; 
			 selectType.appendChild(el);}
		for (var key in profiles)
			{if (key.toLowerCase() == "custom")
        {customProfile = true;}       
       if (profiles[key].hasOwnProperty("selected"))
          {if(profiles[key]["selected"])
            {profileDefault = key;}
           // this extra field breaks the calculations so it should be 
           // removed, if present, at this stage
           delete profiles[key]["selected"];}
       var el = document.createElement("option"); 
			 el.textContent = key; 
			 el.value = key; 
			 selectProf.appendChild(el);}
  
    if (!customProfile) {
      var el = document.createElement("option"); 
			 el.textContent = "Custom"; 
			 el.value = "Custom"; 
			 selectProf.appendChild(el);
       profiles["Custom"] = {"default": {
				"openingHours": 8,
				"maintenance": 2
			}};}
	
		newInputs = false;}

  inputStart.value = getDateStr(vars["start"])
	inputEnd.value = getDateStr(vars["end"])
    
  if (typeof types[vars["type"]] == 'undefined') {
    if (typeDefault) {vars["type"] = typeDefault;}
    else {vars["type"] = Object.keys(types)[0];}
    }
	selectType.value = vars["type"];
  
  if (vars["type"] == "Special Light Sensitivity")
    {$("#annual").removeAttr('readonly');
     $("#minLux").removeAttr('readonly');
     $("#maxLux").removeAttr('readonly');}
  else
    {$("#annual").attr('readonly','readonly');
     $("#minLux").attr('readonly','readonly');
     $("#maxLux").attr('readonly','readonly');}
    
	var displayDetails = document.getElementById('typeComment');
	displayDetails.innerHTML = types[vars["type"]]["comment"];	
       
  if (typeof profiles[vars["prof"]] == 'undefined') {
		if (profileDefault) {vars["prof"] = profileDefault;}
    else {vars["prof"] = Object.keys(profiles)[0];}}
	selectProf.value = vars["prof"];

  if (vars["prof"] == "Custom")
    {$('#customGroup').show();}
  else
    {$('#customGroup').hide();}
    
	use = types[vars["type"]]
	prof = profiles[vars["prof"]];

	var str = "";
  var ohs;
  var xhs;
  
	for (var key in prof)
		{
		var ca = prof[key]
    
    if (ca["openingHours"] == 1) {ohs = "hour"}
    else {ohs = "hours"}
    
    if (ca["maintenance"] == 1) {xhs = "hour"}
    else {xhs = "hours"}
		
		if (key !== "default")
			{
      var closed = false;
            
      if (ca["openingHours"] > 0)
        {opStr = "open for " + ca["openingHours"] + " "+ohs;}
      else
        {opStr = "Closed";
         closed = true;}
         
      if (ca["maintenance"] > 0)
        {          
        if (closed) {
          exStr = ", with " + ca["maintenance"] + " "+xhs+" for operational (cleaning, maintenance, security, etc) activities";}
        else {
          exStr = ", plus an extra " + ca["maintenance"] + " "+xhs;}
        }
      else
        {exStr = "";}
         
      str = str + "<br/>&nbsp;&nbsp;&nbsp;&nbsp; + " + capitalizeFirstLetter(key) + ": " + opStr + exStr;
      }
		else
			{str = str + "Open for " + ca["openingHours"] + " "+ohs+" a day, with an extra " + ca["maintenance"] + " " + xhs + " for operational (cleaning, maintenance, security, etc) activities"}
		}

  if (typeof vars['maxLux'] === undefined || typeof vars['maxLux'] === "boolean" )
		{vars['maxLux'] = parseInt(use['maxLux']);}
    
	if (typeof vars['minLux'] === undefined || typeof vars['minLux'] === "boolean" )
		{vars['minLux'] = parseInt(use['minLux']);}
  
  inputMax.value = vars["maxLux"]
	inputMin.value = vars["minLux"]
  
	displayDetails = document.getElementById('profileDetails');
	displayDetails.innerHTML = str;  
  
  //typeDetails = document.getElementById('typeComment');
	//typeDetails.innerHTML = typeDetails.innerHTML + "<br/><br/>With a display lux minimum of " + vars['minLux'] +" Lux and a display lux maximum of " + vars['maxLux'] + " Lux.";
		
	if (!vars['period'])
		{vars['period'] = parseInt(use['period']);}	
			
	if (!vars['annual'])
		{vars['annual'] = parseInt(use['annual']);}
	inputAN.value = vars['annual'];

	luxValidate ('luxlevel');
	luxValidate ('maintenanceLux');
	luxValidate ('overnightLux');
  otherValidate ('period', 0.1, 100);
	
	if(ie11) /*required to ensure values are displayed*/
		{showDebug("Updating padding on date inputs");
		 $( inputStart ).addClass('ie11date');
		 $( inputEnd ).addClass('ie11date')}

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
		showDebug(false, "Run Function calculateAllowance")
		showDebug(vars, "vars")
		showDebug(use, "use")
		showDebug(prof, "profiles")
    showDebug(false, "Start Calculations ####################################")
		
		// Formulate the Difference between two dates 
		diff = Math.ceil((vars["end"] - vars["start"])/1000); // return seconds
		days = Math.floor(diff / (60*60*24)) + 1;
    showDebug(false, "Exhibitions Days: " + days)
    
    if (vars["annual"] > 0)
				{var useAnn = parseInt(vars["annual"]);}
			else
				{var useAnn = parseInt(use["annual"]);}
        
		var allowance = Math.floor(useAnn * (days/365));
    showDebug(false, "Pro Rata Allowance (Lux.Hrs): " + allowance)
    		
		fullWeeks = Math.floor(days / 7);
		remainderDays = days - (fullWeeks * 7);

		var cluxvals = {}
		var weekLuxTotal = 0;
		
		dayNames.forEach(function (item, index) {
			weekLuxTotal = weekLuxTotal + dayLuxTotal (item);
			});

		showDebug(dayLuxTotals, "dayLuxTotals")
		showDebug(false, "weekLuxTotal: " + weekLuxTotal)
		showDebug(false, "Total Days: " + days)
		showDebug(false, "fullWeeks: " + fullWeeks)
		showDebug(false, "remainding days: " + remainderDays)
		var dn = 0
		var luxTotal = weekLuxTotal * fullWeeks
		showDebug(false, "luxTotal (from full weeks) = " + weekLuxTotal + " * " + fullWeeks + " = " + luxTotal)
		
    // remaining days will begin on the same day as the start day
		while (dn < remainderDays)
			{const tcd = new Date(vars["start"])
			 const tcurrentDate = vars["start"].getDate()
			 tcd.setDate(vars["start"].getDate() + dn)
			 dayOfWeek = dayNames[tcd.getDay()]
			 luxTotal = luxTotal + dayLuxTotals[dayOfWeek]
			 showDebug(false, "Update luxTotal (+ "+dayLuxTotals[dayOfWeek]+" for " +dayOfWeek+" ) = " + luxTotal)			
			 dn++}		

    dn = 0
		
		var resultsDetails = document.getElementById('result');
		$(resultsDetails).removeClass("alert-success alert-danger");
		
    let remainder = Math.floor (allowance - luxTotal)
    
    showDebug(false, "Remaining Lux Allowance = " + remainder)
		var resultStr = "Exhibition (" + days + " days): Allowance: " + allowance + " Lux Hrs<br/>"
    
    let plannedDarkString = "";
    let additionalAllowance = false;
    let adjustedAllowance = false;
    let allowancePerHour = (useAnn * (1/365))/24;
    let resultClass = false;
    let useRemainder = remainder;
    let tab = "&nbsp;&nbsp;&nbsp;&nbsp;";
    let plannedDarkPeriod = 0;
    
    // Some dark storage time is planned
    if (vars["period"] != 100) 
      {      
      showDebug(false, "Period: " + vars["period"])
      showDebug(false, "Float Period: " + parseFloat(vars["period"]))
      let totalEventPeriod = days * (100/parseFloat(vars["period"])) ; //Days
      plannedDarkPeriod = Math.ceil((totalEventPeriod - days) * 24); //Hours
      let plannedDarkYears = Math.floor(plannedDarkPeriod/(24 * 365));
      let plannedDarkRemainder = plannedDarkPeriod % (24 * 365)
      let plannedDarkDays = Math.floor(plannedDarkRemainder/24);
      let plannedDarkHours = Math.ceil(plannedDarkRemainder % 24);
      
      additionalAllowance = Math.floor(allowancePerHour * plannedDarkPeriod);
      adjustedAllowance = allowance + additionalAllowance;      
      useRemainder = Math.floor (adjustedAllowance - luxTotal)
      
      plannedDarkString = tab + tab + "Planned additional dark storage compensation: ";
        
      if (plannedDarkYears)
        {plannedDarkString = plannedDarkString +  plannedDarkYears +" Years ";}
      if (plannedDarkDays)
        {plannedDarkString = plannedDarkString +  plannedDarkDays +" Days ";}
      if (plannedDarkHours)
        {plannedDarkString = plannedDarkString +  plannedDarkHours+" Hours"} 
        
      plannedDarkString = plannedDarkString + "<br/>" + tab + tab + "<b>Adjusted allowance: " + adjustedAllowance + "Lux Hrs</b><br/>"
        
      showDebug(false, plannedDarkString)
      }
		
    if (useRemainder >= 0)
			{
			if (vars["luxlevel"] > 0)
				{var useLux = vars["luxlevel"];}
			else
				{var useLux = parseInt(use["luxlevel"]);}
        
      if (plannedDarkString) {plannedDarkString = "<b>"+plannedDarkString+"</b>";}
		
			resultStr = resultStr + plannedDarkString + "Allocated: " + luxTotal + " Lux Hrs - this leaves "+ useRemainder +" Lux Hrs "+
				" to use for additional events." +
				"<br/>&nbsp;&nbsp;&nbsp;&nbsp;@ "+useLux+" lux this allows " +(useRemainder/useLux).toFixed(2)+ " hrs of exposure"+
				"<br/>&nbsp;&nbsp;&nbsp;&nbsp;@ "+(useLux*0.6).toFixed(0)+" lux (60%) this allows " +(useRemainder/(useLux*0.6)).toFixed(2)+ " hrs of exposure"+
				"<br/>&nbsp;&nbsp;&nbsp;&nbsp;@ "+(useLux*0.4).toFixed(0)+" lux (40%) this allows " +(useRemainder/(useLux*0.4)).toFixed(2)+ " hrs of exposure";
			 resultClass = "alert-success";
       }
		else
			{     
      var darkPeriod = (useRemainder * -1) / allowancePerHour;
      
      let tstr = " ";
      if (plannedDarkPeriod) 
        {darkPeriod = darkPeriod + plannedDarkPeriod;
         tstr = " total ";}
       
      let dyears = Math.floor(darkPeriod/(24 * 365));
      let dremainder = darkPeriod % (24 * 365)
      var ddays = Math.floor(dremainder/24);
      var dhours = Math.ceil(dremainder % 24);
      
      resultStr = resultStr + plannedDarkString + "Allocated: " + luxTotal + 
        " Lux Hrs<br/><b>CAUTION - OVEREXPOSURE BY: " + (useRemainder * -1) + " Lux Hrs<br/>" +
        tab + tab + "Required"+tstr+"dark storage compensation: ";
           
      if (dyears)
        {resultStr = resultStr +  dyears +" Years ";}
      if (ddays)
        {resultStr = resultStr +  ddays +" Days ";}
      if (dhours)
        {resultStr = resultStr +  dhours +" Hours ";}
          
      resultStr = resultStr +  "</b>";
      resultClass = "alert-danger";
      }

    if (resultClass)
      {$(resultsDetails).addClass(resultClass);}
      
    const pakoVars = vars;
    pakoVars["custom"] = profiles["Custom"];
    delete pakoVars["data"];
    const bmCompressed = pako.deflate(JSON.stringify(pakoVars), { level: 9 });
    const bmData = Base64.fromUint8Array(bmCompressed, true);
    const link = "./?data=pako:"+bmData;
  
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


let full = $("#customDetails").find(".form_field_outer_row").first().find("select").clone();

function schange ()
  {console.log("CHAGING")}
  
function resetDaySelectors (which = "add")
  {  
  const fullDaySelectorValues = [	
    "Default", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",  "Sunday"];
  var usedDaySelectorValues = [];
  var checkedDaySelectorValues = [];  
  
  // Remove change event from select elements so they are not fired as they are rebuilt.
  $("#customDetails").find(".form_field_outer_row").find("select").off();
  
  $("#customDetails").find(".form_field_outer_row").each(function( index ) 
    {
    var cv = $(this).find("select")[0].value;
    if (usedDaySelectorValues.includes(cv)) {
      $(this).find("select").find("option[value='"+cv).remove();
      cv = $(this).find("select")[0].value;}    
    if (!usedDaySelectorValues.includes(cv)) {
      usedDaySelectorValues.push(cv);}
    });  
  
  $("#customDetails").find(".form_field_outer_row").each(function( index ) 
    {    
    var cv = $(this).find("select")[0].value;
    
    if (index > 0) // Ignore the first row and leave untouched
      {      
      $(this).find("select").find("option").remove();
    
      // ensure that all possible options are added to the select
      for(var i=0;i<fullDaySelectorValues.length;i++)      
        {var optn = fullDaySelectorValues[i];
         var el = document.createElement("option");
         el.textContent = optn;
         el.value = optn;
         $(this).find("select").append(el);}
         
      // remove options that are in use already
        for(var i=0;i<usedDaySelectorValues.length;i++)
          {if (cv != usedDaySelectorValues[i] || checkedDaySelectorValues.includes(cv)) {
            $(this).find("select").find("option[value='"+usedDaySelectorValues[i]).remove();}}
           
      var here = $(this).find("select").val(cv).change();
      if (!here[0].value) {$(this).find("select").val($(this).find("select").find("option").first()[0].value).change();}
      }     
    
    if (!checkedDaySelectorValues.includes(cv))
      {checkedDaySelectorValues.push(cv);}
    }); 
   
  $("#customDetails").find(".form_field_outer_row").find("select").on('change', function() {resetDaySelectors("manual");});
  customValidate();
  }

function addCustomRow (rowToCopy=false, dayValue="default", openHrs=8, extraHrs=2)
  {  
  if (!rowToCopy)
    {rowToCopy = $("#customDetails").find(".form_field_outer_row").last()}
  
  var rowCopy = $(rowToCopy).clone(true);
  let formOuter = $(rowToCopy).closest(".form_field_outer");
  
  $(rowCopy).find("select").prop("disabled", false);  
  $(formOuter).last().append(rowCopy).find(".remove_node_btn_frm_field:not(:first)").prop("disabled", false);
  $(formOuter).find(".form_field_outer_row").last().find("select").prop("disabled", false);
  
  
  
  if (dayValue) {
    $(rowCopy).find("select").val(dayValue).change();}
  if (openHrs) {
    $(rowCopy).find(".openhrs").val(openHrs).change();}
  if (extraHrs) {
    $(rowCopy).find(".extrahrs").val(extraHrs).change();}
  resetDaySelectors("add");
 
  $(formOuter).find(".remove_node_btn_frm_field").first().prop("disabled", true);
        
  // Only allow a max of 7 settings.
  if ($(formOuter).find(".form_field_outer_row").length == 7)
    {$(formOuter).find(".add_node_btn_frm_field").prop("disabled", true);}  
  }
  
function customValidate ()
  {
  var newCustom = {};
  var error = false;
   
  //console.log("customValidate");
  
  $("#customDetails").find(".form_field_outer_row").find(".openhrs").removeClass("alert alert-success alert-danger alert-warning");
  $("#customDetails").find(".form_field_outer_row").find(".extrahrs").removeClass("alert alert-success alert-danger alert-warning");
  
  $("#customDetails").find(".form_field_outer_row").each(function( index ) 
    {
    var dv = $(this).find("select")[0].value.toLowerCase();
    var ov = $(this).find(".openhrs")[0].value;
    var ovInt = parseInt(ov);
    var xv = $(this).find(".extrahrs")[0].value;
    var xvInt = parseInt(xv);
     
    //console.log (typeof ov);
    //console.log (ov);
    //console.log (typeof ovInt);
    //console.log (ovInt);
    
    if (!ov)
      {error = true;
       $(this).find(".openhrs").addClass("alert alert-warning")}    
    else if (isNaN(ovInt) || ovInt < 0 || (ovInt + xvInt > 24))
      {error = true;
       $(this).find(".openhrs").addClass("alert alert-danger")}
       
    if (!xv)
      {error = true;
       $(this).find(".extrahrs").addClass("alert alert-warning")}    
    else if (isNaN(xvInt) || xvInt < 0 || (ovInt + xvInt > 24))
      {error = true;
       $(this).find(".extrahrs").addClass("alert alert-danger")}      

    newCustom[dv] ={
        "maintenance": xv,
        "openingHours": ov
      };      
    });
    
  if (!error) {
    profiles["Custom"] = newCustom
    populateInputs();
    } 
  }
  
function checkExternalURL (exURL, dvars=false)//tV=false, pV=false)
  {
  //console.log("checkExternalURL")// ("+exURL+", "+tV+", "+pV)
  fetch(exURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
        }
      return response.json()
      })
    .then((json) => 
      {
      extraProfiles = json["light-profiles"];
      extraTypes = json["object-types"]; 
      
      types = $.extend(types, json["object-types"]); 

      for (const [key, value] of Object.entries(extraTypes)) {
        $('#type').append($('<option></option>').val(key).html(key));}
                        
      profiles = $.extend(profiles, json["light-profiles"]);  
      
      for (const [key, value] of Object.entries(extraProfiles)) {
        $('#prof').append($('<option></option>').val(key).html(key));}
        
      if (dvars) {
        if (dvars["type"]) {$('#type').val(dvars["type"]).change();} 
        if (dvars["prof"]) {$('#prof').val(dvars["prof"]).change();}
      
        for (var key in dvars)
          {if (key == "start" || key == "end")
            {vars[key] = new Date(dvars[key])}
           else
            {vars[key] = dvars[key];}}
        }
      
      rebuildCustom ()    
      })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
      });     
  }
  
function rebuildCustom ()
  {
  if (vars["custom"])
    {profiles["Custom"] = vars["custom"]}
     
  if (profiles.hasOwnProperty("Custom"))
    {
    for (const [key, value] of Object.entries(profiles["Custom"])) {
      if (key != "default")
        {const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
         addCustomRow (false, capitalized, value["openingHours"], value["maintenance"]);}
      else
        {$("#customDetails").find(".form_field_outer_row").first().find(".openhrs").val(value["openingHours"]).change();
         $("#customDetails").find(".form_field_outer_row").first().find(".extrahrs").val(value["maintenance"]).change();}
      }
    }    
  }
  
// JS plus relates html based on example provided at: https://bootstrapfriendly.com/blog/dynamically-add-or-remove-form-input-fields-using-jquery/ (26/09/22
///======Clone method
$(document).ready(function () { 
  
  // required if people still using ie11	
if (ie11) {
  checkurlParams = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null){
       return null;
    }
    else {
       return decodeURI(results[1]) || 0;
    }}

  for (var key in vars)
	{if (checkurlParams(key))
		{if (key == "start" || key == "end")
			{vars[key] = new Date(checkurlParams(key) + "T00:00")}
		 else
			{vars[key] = checkurlParams(key)}}}
  }
else {
	urlParams = new URLSearchParams(queryString);
  
  if (urlParams.has("url")) {
    checkExternalURL (urlParams.get("url"))}
    
	for (var key in vars)
	{if (urlParams.has(key))
		{
    //console.log(key + ": " +urlParams.get(key))
    if (key == "start" || key == "end")
			{vars[key] = new Date(urlParams.get(key) + "T00:00")}
		 else
			{vars[key] = urlParams.get(key)}}}}
    
if(vars["data"])
  {
  const d1 = Base64.toUint8Array(vars["data"].slice(5));      
  const d2 = pako.inflate(d1, { to: 'string' })
  const dvars = JSON.parse(d2);  
  
  if (dvars["url"]) 
    {
    checkExternalURL (dvars["url"], dvars)
    }
  else
    {  
    for (var key in dvars)
      {if (key == "start" || key == "end")
        {vars[key] = new Date(dvars[key])}
       else
        {vars[key] = dvars[key];}}
    rebuildCustom ()
    } 
  }
else
  {rebuildCustom () }

  

  $("body").on("click", ".add_node_btn_frm_field", function (e) {
    e.preventDefault();
    addCustomRow ($(e.target).closest(".form_field_outer_row"), false, false, false);
  });

  $("body").on("click", "#updateCustom", function (e) {
    e.preventDefault();    
    
    var newCustom = {};
    var error = false;
    //profiles["Custom"] = {};
    
    $("#customDetails").find(".form_field_outer_row").each(function( index ) 
      {
      var dv = $(this).find("select")[0].value.toLowerCase();
      var ov = $(this).find(".openhrs")[0].value;
      var xv = $(this).find(".extrahrs")[0].value;
      
      //if (ov < 0 || xv < 0 || (ov + xv > 24))
      //  {error = "Hours values cannot be negative and they must add up to less than 24"}
      //else if (ov === 0 || xv === 0 )
      
            
      //profiles["Custom"][dv] ={
      newCustom[dv] ={
          "maintenance": xv,
          "openingHours": ov
        };      
    });  
    
    if (!error) {
      profiles["Custom"] = newCustom
      populateInputs();
      }
  }); 

  //===== delete the form field row
  $("body").on("click", ".remove_node_btn_frm_field", function () {
        
    // Only allow a max of 7 settings.
    if ($(this).closest(".form_field_outer").find(".form_field_outer_row").length == 7)
      {$(this).closest(".form_field_outer").find(".add_node_btn_frm_field").prop("disabled", false);}
      
    $(this).closest(".form_field_outer_row").remove();
    resetDaySelectors ("delete");
    
  });
  
  // The period value is not yet used in calculations
  //$("#period").closest(".input-group").parent().addClass("d-none");
  //$("#period").attr('readonly','readonly');
});
