<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'connect.php';

$data = json_decode(file_get_contents("php://input"));

$username = trim($data->userName ?? '');
$password = trim($data->password ?? '');
$email = trim($data->emailAddress ?? '');

// Validate required fields
if ($username === '' || $password === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username, password, and email are required']);
    exit;
}

// Optional: validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Check if username or email already exists
$check = $con->prepare("SELECT * FROM registrations WHERE userName = ? OR emailAddress = ?");
$check->bind_param("ss", $username, $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insert = $con->prepare("INSERT INTO registrations (userName, password, emailAddress) VALUES (?, ?, ?)");
$insert->bind_param("sss", $username, $hashedPassword, $email);

if ($insert->execute()) {
    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Username already exists']);
}
