<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

    $failedAttempts = (int)$user['failed_attempts'];
    $lastFailedLogin = strtotime($user['last_faild_login'] ?? '2000-01-01');
    $now = time();

    $lockoutDuration = 5 * 60; // 5 minutes lockout after 3 failed attempts

    if ($failedAttempts >= 3 && ($now - $lastFailedLogin) < $lockoutDuration) {
        $remaining = $lockoutDuration - ($now - $lastFailedLogin);
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => "Too many failed attempts. Please wait {$remaining} seconds.",
            'lockout' => true,
            'remainingSeconds' => $remaining
        ]);
        exit;
    }

    if (password_verify($password, $user['password'])) {
        // Reset failed attempts
        $reset = $con->prepare("UPDATE registrations SET failed_attempts = 0, last_faild_login = NULL WHERE userName = ?");
        $reset->bind_param("s", $username);
        $reset->execute();

        $_SESSION['loggedIn'] = true;
        $_SESSION['username'] = $username;

        echo json_encode(['success' => true, 'message' => 'Login successful']);
    } else {
        // Increment failed attempts
        $failedAttempts++;
        $nowFormatted = date('Y-m-d H:i:s', $now);

        $update = $con->prepare("UPDATE registrations SET failed_attempts = ?, last_faild_login = ? WHERE userName = ?");
        $update->bind_param("iss", $failedAttempts, $nowFormatted, $username);
        $update->execute();

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password',
            'failedAttempts' => $failedAttempts,
            'lastFailedLogin' => $nowFormatted
        ]);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
