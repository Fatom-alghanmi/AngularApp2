<?php
require 'connect.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read POST data
$data = json_decode(file_get_contents("php://input"), true);

if (
    isset($data['name']) && !empty($data['name']) &&
    isset($data['date']) && !empty($data['date']) &&
    isset($data['time']) && !empty($data['time']) &&
    isset($data['guests']) && is_numeric($data['guests']) &&
    isset($data['location']) && !empty($data['location'])
) {
    $name = mysqli_real_escape_string($con, $data['name']);
    $date = mysqli_real_escape_string($con, $data['date']);
    $time = mysqli_real_escape_string($con, $data['time']);
    $guests = (int)$data['guests'];
    $location = mysqli_real_escape_string($con, $data['location']);

    $sql = "INSERT INTO reservations (name, date, time, guests, location)
            VALUES ('$name', '$date', '$time', $guests, '$location')";

    if (mysqli_query($con, $sql)) {
        echo json_encode(['message' => 'Reservation added successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => mysqli_error($con)]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid fields']);
}
