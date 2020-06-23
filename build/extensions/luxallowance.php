<?php

$extensionList["luxallowance"] = "extensionLuxAllowance";

function titleRow ($str)
  {$str = '<div class="row"><div class="col-md-12"><h5>'.
    $str.'</h5></div></div>';
   return($str);}

function formInput($name, $title, $type, $value=false, $cols=6, $nlw = 75, $jsfn="",
  $trTxt=false, $trw=70, $readonly=false, $placeholder=false)
  {
  $nameLeft = '<div class="input-group-prepend">'.
    '<span class="input-group-text" style="width:'.
      $nlw.'px;" id="basic-addon-'.$name.'">'.$title.'</span></div>';
  $exl = "";
  $exr = "";
  $describeBy = ' aria-label="'.$title.
    '" aria-describedby="basic-addon-'.$name.'"';

  if ($readonly)
    {$readonly = "readonly";}
    
  if ($trTxt)
    {$tagRight = '<div class="input-group-append"><span style="'.
      'min-width:'.$trw.'px;"  class="input-group-text" id="basic-addon-'.
      $name.'-units">'.$trTxt.'</span></div>';}
  else
    {$tagRight = "";}

  if ($type == "date")
    {
    $exl = '<div class="datepicker date input-group p-0 shadow-sm">';
    $exr = '</div>';
    $tagRight = '<div class="input-group-append"><span class="'.
      'input-group-text px-4"><i class="fa fa-calendar-o"></i>'.
      '</span></div>';
    $input = '<input onchange="'.$jsfn.'(this.id)" type="text" placeholder="'.
      $title.' date" class="form-control py-4 px-4" id="'.$name.'" '. 
      $describeBy.' '.$readonly.'>';
    }
  else if ($type == "select")
    {
    $input = '<select onchange="'.$jsfn.'(this.id)" class="form-control" id="'.
      $name.'" '.$describeBy.' '.$readonly.'></select>';
    }
  else //if ($type == "text")
    {
    $input = '<input onChange="'.$jsfn.'(this.id)" placeholder="'.$placeholder.'" '.
      'type="text" class="form-control" id="'.$name.'" '.$describeBy.
      ' '.$readonly.'>';
    }
    
    
  ob_start();
	echo <<<END
  <div class="input-group col-md-${cols}">						
    $exl
      $nameLeft
			$input
			$tagRight
    $exr
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
  
  $pd["extra_js_scripts"][] =
			"https://unpkg.com/bootstrap-datepicker@1.9.0/dist/js/bootstrap-datepicker.min.js";
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
    "prof" => formInput("prof", "Opening Profile", "select", false, 12, 150, "profUpdate"),
    "type" => formInput("type", "Object Type", "select", false, 12, 150, "typeUpdate"),
    "annual" => formInput("annual", "Annual Allowance", "text", false,
      6, 150, false, "Lux Hrs", 70, true),
    "luxlevel" => formInput("luxlevel", "Standard", "text", false, 6, 150,
      "luxUpdate", "Lux", 70, false, "Lux Levels"),
    "maintenance" => formInput("maintenanceLux", "Cleaning/Security",
      "text", false, 6, 150, "luxUpdate", "Lux", 70, false),
    "overnight" => formInput("overnightLux", "Overnight", "text", false,
      6, 150, "luxUpdate", "Lux", 70, false)
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
			
      <div class="row" style="margin-bottom: 1rem;">
        $inputs[prof]
      </div>		

      $alerts[prof]
      $titles[luxlevels]
					
      <div class="row" style="margin-bottom: 1rem;">
        $inputs[type]			
      </div>		

      $alerts[type]
    
      <div class="row ">
        $inputs[annual]
        $inputs[luxlevel]
        $inputs[maintenance]
        $inputs[overnight]
      </div>

      $alerts[result]
					
    <div class="row" style="padding-left:15px;padding-right:15px;">
      <a class="btn btn-outline-secondary btn-sm" id="linkButton" href="#" role="button">Shareable Link</a>
    </div>
  
  </div> <!-- End Container -->
</div><!-- End Form -->
</form>
END;
    $mcontent = ob_get_contents();
		ob_end_clean(); // Don't send output to client

		$d["content"] = positionExtraContent ($d["content"], $mcontent);

		}	

  return (array("d" => $d, "pd" => $pd));
  }
    
?>
