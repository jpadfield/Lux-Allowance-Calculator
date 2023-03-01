<?php

$extensionList["luxallowance"] = "extensionLuxAllowance";

function titleRow ($str)
  {$str = '<div class="row"><div class="col-md-12"><h5>'.
    $str.'</h5></div></div>';
   return($str);}

function formInput($name, $title, $type, $value=false, $cols=6, $tlw = 75, $jsfn="",
  $trTxt=false, $trw=70, $readonly=false, $placeholder=false, $multiple=false, $extraClasses="")
  {
  
  $igExClass = "";
  
  
  if ($title)
    {
    ob_start();
    echo <<<END
    <span class="input-group-append" style="width:${tlw}px;" id="basic-addon-$name" for="$name">
      <span class="input-group-text d-block">
        $title
      </span>
    </span>	
END;
    $tagLeft = ob_get_contents();
    ob_end_clean(); // Don't send output to client
    }
  else
    {$tagLeft = "";}

  $describeBy = " aria-label=\"$title\" aria-describedby=\"basic-addon-$name\"";
    
  if ($readonly)
    {$readonly = "readonly";}

  if ($type == "date")
    {
    $igExClass = "date datepicker";
    $trTxt = "<i class=\"fa-regular fa-calendar\"></i>";
    
    $input = '<input onchange="'.$jsfn.'(this.id)" type="text" class="form-control '.$extraClasses.'" id="'.
      $name.'" name="'.$name.'" '.$describeBy.' '.$readonly.'/>';
    }
  else if ($type == "select")
    {
    if ($readonly)
      {$readonly = "disabled";}
    
    $input = '<select onchange="'.$jsfn.'(this.id)" class="form-select '.$extraClasses.'" id="'.
      $name.'" name="'.$name.'" '.$describeBy.' '.$readonly.'>';
      
    if ($value)
      {if (!is_array($value)) {$value = array($value => $value);}
       foreach ($value as $k => $v)
        {$input .= '<option value="'.$v.'">'.$v.'</option>';}}
        
    $input .= '</select>';
    }
  else //if ($type == "text")
    {
    $input = '<input onChange="'.$jsfn.'(this.id)" placeholder="'.$placeholder.'" '.
      'type="text" class="form-control '.$extraClasses.'" id="'.$name.'" name="'.$name.'" '.$describeBy.
      ' '.$readonly.'>';
    }
      
  if (!$trTxt)
    {$trTxt = "&nbsp;";}
      
  ob_start();
  echo <<<END
    <span class="input-group-append" style="width:${trw}px;" >
      <span class="input-group-text d-block" id="basic-addon-${name}-units">
        $trTxt
      </span>
    </span>	
END;
  $tagRight = ob_get_contents();
  ob_end_clean(); // Don't send output to client

  ob_start();
	echo <<<END
  <div class="col-md-$cols col-sm-12 pb-2">
    <div style="border: 1px solid #e9ecef; border-top-right-radius: 30rem; border-bottom-right-radius: 30rem;">
      <div class="input-group $igExClass">
        $tagLeft						
	$input
	$tagRight
      </div>
    </div>	
  </div>
END;
  $html = ob_get_contents();
  ob_end_clean(); // Don't send output to client
  return ($html);
  }
  
function alertRow ($id, $type, $comment, $tp=0)
  {
  ob_start();
  echo <<<END
  <div class="row" style="padding-left:15px;padding-right:15px;margin-top:${tp}rem;">
    <div class="alert alert-${type} col-md-12" role="alert" id="$id">
      $comment</div></div>
END;
  $html = ob_get_contents();
  ob_end_clean(); // Don't send output to client
  return ($html);
  }
      
function extensionLuxAllowance ($d, $pd)
  {
  if (isset($d["file"]) and file_exists($d["file"]))
		{$dets = getRemoteJsonDetails($d["file"], false, true);}
  else
    {$dets = array();}
    
  $versions = array(
    "bootstrap-datepicker" => "1.9.0",
    "pako" => "2.1.0",
    "base64" => "3.7.3"
  );
  
  $pd["extra_js_scripts"][] = "https://unpkg.com/bootstrap-datepicker@".
    $versions["bootstrap-datepicker"]."/dist/js/bootstrap-datepicker.min.js";
  $pd["extra_js_scripts"][] = "https://cdn.jsdelivr.net/npm//pako@".$versions["pako"]."/dist/pako.min.js";
  $pd["extra_js_scripts"][] = "https://cdn.jsdelivr.net/npm/js-base64@".$versions["base64"]."/base64.min.js";
  $pd["extra_js_scripts"][] =
			"js/luxAllCalc.js";

  $pd["extra_css_scripts"][] =
    "https://unpkg.com/bootstrap-datepicker@1.9.0/dist/css/bootstrap-datepicker.min.css";
  $pd["extra_css_scripts"][] =
    "css/luxAllCalc.css";
      
  $pd["extra_js"] .= "
    types = ".json_encode($dets["object-types"])."
    profiles = ".json_encode($dets["light-profiles"])."
    ";

  $pd["extra_onload"] .= "

  $(function () { // INITIALIZE DATEPICKER PLUGIN
    $('.datepicker').datepicker({
      clearBtn: true,
      format: \"yyyy-mm-dd\"});});

  $(function () {
    $('[data-toggle=\"tooltip\"]').tooltip()})

  buildDropdowns ()
  
  $(function () {
		use = types[vars[\"type\"]]
		prof = profiles[vars[\"prof\"]];
		populateInputs()});
  ";
   
  $titles = array(
    "dates" => titleRow ("Dates"),
    "openinghours" => titleRow ("Opening Hours"),
    "luxlevels" => titleRow ("Object Type - Lux Levels")
    );

  $inputs = array(
    "start" => formInput("start", "Start", "date", false, 6, 75, "dateUpdate"),
    "end" => formInput("end", "End", "date", false, 6, 75, "dateUpdate"),
    "prof" => formInput("prof", "Opening Profile", "select", false, 12, 150, "profUpdate", "", "30"),
    "type" => formInput("type", "Object Type", "select", false, 12, 150, "typeUpdate", "", "30"),
    "annual" => formInput("annual", "Annual Allowance", "text", false,
      6, 150, "luxUpdate", "Lux Hrs", 70, true),
    "luxlevel" => formInput("luxlevel", "Display", "text", false, 6, 150, "luxUpdate", "Lux", 70, false, "Lux Levels"),    
    "maintenance" => formInput("maintenanceLux", "Operational",
      "text", false, 6, 150, "luxUpdate", "Lux", 70, false),
    "overnight" => formInput("overnightLux", "Room Closed", "text", false,
      6, 150, "luxUpdate", "Lux", 70, false),
    "period" => formInput("period", "Display Period", "text", false,
      6, 150, "otherUpdate", "%", 70, false),
    "minLux" => formInput("minLux", "Min Display Lux", "text", false, 6, 150, 
      "luxMMUpdate", "Lux", 70, true, "Min Lux Levels"),
    "maxLux" => formInput("maxLux", "Max Lux", "text", false, 6, 150, 
      "luxMMUpdate", "Lux", 70, true, "Max Lux Levels")
    );
    
    		//do we need tooltips?			
		//<div class="input-group col-md-6" data-toggle="tooltip" data-placement="top" title="Standard operating lux Level.">

  $alerts = array(
    "prof" => alertRow ("profileDetails", "info", "... selected profile details"),
    "type" => alertRow ("typeComment", "info", "... brief description of this object type"),
    "result" => alertRow ("result", "success", "... the calculated results", 1)    
    );
    
	if (isset($d["file"]) and file_exists($d["file"]))
		{
    
  //function formInput($name, $title, $type, $value=false, $cols=6, $tlw = 75, $jsfn="",
  //$trTxt=false, $trw=70, $readonly=false, $placeholder=false, $multiple=false, $extraClasses="")
    $days = array("Default", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday", "Sunday");      
    $day = formInput("day", "", "select", $days, 12, 75, "", 
      "<i class=\"fa-solid fa-calendar-day\"></i>", "45", true);
    
   $openHrs = formInput("openhours", "", "text", false, 12, "",
      "customValidate", "Hrs", 70, false, "Open Hrs ...", false, "openhrs");
      
    $extraHrs = formInput("extrahours", "", "text", false, 12, "",
      "customValidate", "Hrs", 70, false, "Extra Hrs ...", false, "extrahrs");

      
    ob_start();
    echo <<<END
<div  id="customGroup" style="display:none;padding-bottom:10px;">		
  <div class="row pb-1 d-md-block d-none" style="">  	
    <div class="row"> 
      <div class="col-md-4"></div>
      <div class="col-md-3 text-center">
        <u>Opening Hours</u>
      </div>	    
      <div class="col-md-3 text-center">
        <u>Extra Cleaning/Security Hours</u>
      </div>
      <div class="col-md-2">
      </div>
    </div> 
  </div>
  
  <div class="row form_field_outer" id="customDetails" style="">  	
    <div class="row form_field_outer_row"> 
      <div class="form-group col-md-1 col-0 order-1"></div>
      <div class="form-group col-md-3 col-6 order-2">
        $day
      </div>    
      <div class="form-group col-md-3 col-6 order-md-3 order-4 border-bottom mb-2">
        $openHrs
      </div>	    
      <div class="form-group col-md-3 col-6 order-md-4 order-5 border-bottom mb-2">
        $extraHrs
      </div>
      <div class="form-group col-md-2 col-6 order-md-5 order-3 add_del_btn_outer text-end">
        <button type="button" class="btn_round add_node_btn_frm_field" title="Copy or clone this row">
          <i class="fas fa-copy"></i>
        </button>
        <button type="button" class="btn_round remove_node_btn_frm_field" disabled="">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      
      
    </div> 
  </div>   	
  <div class="row form_field_outer d-none">
    
    <div class="row form_field_outer_row"> 
      <div class="form-group col-md-12 text-end">
        <button type="button" id="updateCustom" class="btn btn-outline-secondary btn-sm" title="Update Custom Settings">
          Update Custom Settings
        </button>        
      </div>
    </div> 
    
  </div>
</div>      
END;
    $custom = ob_get_contents();
		ob_end_clean(); // Don't send output to client
    
		ob_start();
		echo <<<END
		
<form>
  <div class="form-group mb-4"> <!-- Start Form -->
    <div class="container"> <!-- Start Container -->

      $titles[dates]
			
      <div class="row ">  <!-- Start Row -->	
	$inputs[start]	
	$inputs[end]			
      </div>

      $titles[openinghours]
			
      <div class="row" style="margin-bottom: 0.5rem;">
        $inputs[prof]
      </div>		
      
      $custom
      $alerts[prof]
      $titles[luxlevels]
					
      <div class="row" style="margin-bottom: 0.5rem;">
        $inputs[type]			
      </div>		

      $alerts[type]
    
      <div class="row ">
	$inputs[minLux]
	$inputs[maxLux]
        $inputs[annual]
        $inputs[luxlevel]
        $inputs[maintenance]
        $inputs[overnight]
        $inputs[period]
      </div>

      $alerts[result]
					
    <div class="row" style="padding-left:15px;padding-right:15px;">
      <a class="btn btn-outline-secondary btn-sm" style="width:auto;" id="linkButton" href="#" role="button">Shareable Link</a>
    </div>
  
  </div> <!-- End Container -->
</div><!-- End Form -->
</form>
END;
    $mcontent = ob_get_contents();
		ob_end_clean(); // Don't send output to client

		$d = positionExtraContent ($d, $mcontent);

		}	

  return (array("d" => $d, "pd" => $pd));
  }
    
?>
