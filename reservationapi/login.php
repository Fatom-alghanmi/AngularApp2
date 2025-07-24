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

ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', 'Off');

session_start();

require 'connect.php';

$data = json_decode(file_get_contents("php://input"));

$username = trim($data->userName ?? '');
$password = trim($data->password ?? '');

// Validate required fields
if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit;
}

$query = $con->prepare("SELECT * FROM registrations WHERE userName = ?");
$query->bind_param("s", $username);
$query->execute();
$result = $query->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        $_SESSION['loggedIn'] = true;
        $_SESSION['username'] = $username;

        echo json_encode(['success' => true, 'message' => 'Login successful']);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid password']);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
