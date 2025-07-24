<?php
require 'connect.php';

// CORS headers (needed for browser requests)
//header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Preflight handling for OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Read id from query string (GET)
$id = (isset($_GET['id']) && (int)$_GET['id'] > 0) ? (int)$_GET['id'] : false;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid ID']);
    exit;
}

// Step 1: Retrieve image name
$query = "SELECT imageName FROM reservations WHERE id = {$id} LIMIT 1";
$result = mysqli_query($con, $query);

if ($result && mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    $imageName = $row['imageName'];

    // Step 2: Delete image if not placeholder
    if ($imageName !== 'placeholder_100.jpg') {
        $imagePath = __DIR__ . "/uploads/" . $imageName;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }

    // Step 3: Delete reservation
    $sql = "DELETE FROM reservations WHERE id = {$id} LIMIT 1";
    if (mysqli_query($con, $sql)) {
        echo json_encode(['message' => 'Reservation deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete reservation']);
    }

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Reservation not found']);
}
?>