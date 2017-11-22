<div class="title">Blog</div>

<?php
	include('dbconnect.php');

	$sql = 'select * from blog order by date desc';
	$result = $mysqli->query($sql);
	while($row = $result->fetch_array())
	{
		$date = explode('-', $row['date']);
		$year = $date[0];
		$month = $date[1];
		$day = $date[2];
		
		if($day==1 || $day==21 || $day==31)
		{
			$day .= 'st';
		}
		else if($day==2 || $day==22)
		{
			$day .= 'nd';
		}
		else
		{
			$day .= 'th';
		}
		
		switch($month)
		{
			case '01':
				$month = 'January';
				break;
			case '02':
				$month = 'February';
				break;
			case '03':
				$month = 'March';
				break;
			case '04':
				$month = 'April';
				break;
			case '05':
				$month = 'May';
				break;
			case '06':
				$month = 'June';
				break;
			case '07':
				$month = 'July';
				break;
			case '08':
				$month = 'August';
				break;
			case '09':
				$month = 'September';
				break;
			case '10':
				$month = 'October';
				break;
			case '11':
				$month = 'November';
				break;
			case '12':
				$month = 'December';
				break;
		}
	
		echo '<div class="title2">'.$day.' '.$month.' '.$year.'</div>';
		echo '<p>'.$row['text'].'</p>';
	}
?>
