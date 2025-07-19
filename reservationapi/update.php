<?php
require 'connect.php';

header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST allowed']);
    exit;
}

// Sanitize & Fetch Input
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$name = mysqli_real_escape_string($con, $_POST['name'] ?? '');
$date = mysqli_real_escape_string($con, $_POST['date'] ?? '');
$time = mysqli_real_escape_string($con, $_POST['time'] ?? '');
$guests = isset($_POST['guests']) ? (int)$_POST['guests'] : 1;
$location = mysqli_real_escape_string($con, $_POST['location'] ?? '');
$booked = isset($_POST['booked']) ? (int)$_POST['booked'] : 0;
$oldImageName = mysqli_real_escape_string($con, $_POST['oldImageName'] ?? '');
$imageName = $oldImageName;

// Validate required fields
if ($id <= 0 || $name === '' || $date === '' || $time === '' || $location === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields or invalid ID']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/';

// Handle Image Upload (if new image provided)
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $newImageName = basename($_FILES['image']['name']);

    if ($newImageName !== 'placeholder_100.jpg') {
        // Prevent duplicate image name (excluding current reservation)
        $stmtCheck = $con->prepare("SELECT id FROM reservations WHERE imageName = ? AND id != ? LIMIT 1");
        $stmtCheck->bind_param('si', $newImageName, $id);
        $stmtCheck->execute();
        $stmtCheck->store_result();
        if ($stmtCheck->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Image name already exists for another reservation']);
            exit;
        }
        $stmtCheck->close();
    }

    // Save new image using original filename
    $destination = $uploadDir . $newImageName;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
        // Delete old image (if not placeholder and not same as new)
        if (!empty($oldImageName) && $oldImageName !== 'placeholder_100.jpg' && $oldImageName !== $newImageName) {
            $oldImagePath = $uploadDir . $oldImageName;
            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        // Update image name in DB
        $imageName = $newImageName;
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload new image.']);
        exit;
    }
}

// Update reservation
$sql = "UPDATE reservations SET name=?, date=?, time=?, guests=?, location=?, booked=?, imageName=? WHERE id=? LIMIT 1";
$stmt = $con->prepare($sql);
$stmt->bind_param("sssisisi", $name, $date, $time, $guests, $location, $booked, $imageName, $id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(['message' => 'Reservation updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database update failed: ' . $stmt->error]);
}

$stmt->close();
?>
