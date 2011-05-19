<?php
	$host = "newtonweb.dyndns.org:3306";
	$username = "meetpoint3d";
	$password = "***";
	$db  = "meetpoint3d";
	
	mysql_connect($host, $username, $password) or die('Could not connect to database.');
	mysql_select_db($db) or die('Could not select database.');
?>
