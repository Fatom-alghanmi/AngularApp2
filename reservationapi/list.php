<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require 'connect.php';

// Query database
$sql = "SELECT id, name, date, time, guests, location, imageName, booked FROM reservations ORDER BY date, time";
$result = mysqli_query($con, $sql);

$reservations = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $reservations[] = $row;
    }
    echo json_encode(['data' => $reservations]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed: ' . mysqli_error($con)]);
}
?>
