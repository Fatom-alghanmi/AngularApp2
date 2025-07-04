<?php
require 'connect.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if it's a POST request with form-data
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST allowed']);
    exit;
}

// Read data from $_POST
$name = $_POST['name'] ?? '';
$date = $_POST['date'] ?? '';
$time = $_POST['time'] ?? '';
$guests = isset($_POST['guests']) ? (int)$_POST['guests'] : 0;
$location = $_POST['location'] ?? '';
$imageName = 'placeholder.jpg';

// Validate inputs
if (!$name || !$date || !$time || !$guests || !$location) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Handle image upload if present
if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
    $uploadDir = __DIR__ . '/uploads/';
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $imageName = uniqid('img_') . '.' . $ext;
    $uploadPath = $uploadDir . $imageName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save image']);
        exit;
    }
}

// Insert into database
$sql = "INSERT INTO reservations (name, date, time, guests, location, imageName)
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $con->prepare($sql);
$stmt->bind_param("sssiss", $name, $date, $time, $guests, $location, $imageName);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Reservation added successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error]);
}
