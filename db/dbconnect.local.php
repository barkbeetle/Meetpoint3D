<?php
	$host = "localhost://opt/local/var/run/mysql5/mysqld.sock";
	$username = "meetpoint3d";
	$password = "mp3d";
	$db  = "meetpoint3d";
	
	mysql_connect($host, $username, $password) or die('Could not connect to database.');
	mysql_select_db($db) or die('Could not select database.');
?>
