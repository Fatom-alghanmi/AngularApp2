<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require 'connect.php';

require 'connect.php';

// Allow CORS for Angular and set content type to JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$sql = "SELECT id, name, date, time, guests FROM reservations ORDER BY date, time";
$result = mysqli_query($con, $sql);

$reservations = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $reservations[] = $row;
    }
    echo json_encode(['data' => $reservations]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'No reservations found']);
}
?>
