<?php
require 'connect.php';
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests allowed']);
    exit;
}

// Extract and sanitize input
$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
$name = trim($_POST['name'] ?? '');
$date = trim($_POST['date'] ?? '');
$time = trim($_POST['time'] ?? '');
$guests = isset($_POST['guests']) ? (int) $_POST['guests'] : 0;
$location = trim($_POST['location'] ?? '');
$booked = isset($_POST['booked']) ? (int) $_POST['booked'] : 0;

if ($id < 1 || !$name || !$date || !$time || !$guests || !$location) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

// Prevent duplicate user reservation (same name, date, time, guests), excluding current ID
$userDupSql = "SELECT id FROM reservations 
               WHERE name = ? AND date = ? AND time = ? AND guests = ? AND id != ? 
               LIMIT 1";
$stmt = $con->prepare($userDupSql);
$stmt->bind_param("sssii", $name, $date, $time, $guests, $id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Duplicate reservation for this user at the selected date and time']);
    $stmt->close();
    exit;
}
$stmt->close();

// Prevent double-booking the same location if booked=1
if ($booked === 1) {
    $locDupSql = "SELECT id FROM reservations 
                  WHERE location = ? AND date = ? AND time = ? AND booked = 1 AND id != ?
                  LIMIT 1";
    $stmt2 = $con->prepare($locDupSql);
    $stmt2->bind_param("sssi", $location, $date, $time, $id);
    $stmt2->execute();
    $stmt2->store_result();

    if ($stmt2->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'This location is already booked at the selected date and time']);
        $stmt2->close();
        exit;
    }
    $stmt2->close();
}

// Handle image upload if new image is provided
$newImageName = $_POST['oldImageName'] ?? ''; // default to old image

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'uploads/';
    $originalName = basename($_FILES['image']['name']);
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $baseName = pathinfo($originalName, PATHINFO_FILENAME);

    $newImageName = $originalName;
    $counter = 1;
    while (file_exists($uploadDir . $newImageName)) {
        $newImageName = $baseName . '_' . $counter . '.' . $extension;
        $counter++;
    }

    $targetPath = $uploadDir . $newImageName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload new image']);
        exit;
    }

    // Delete old image if it’s not placeholder and different
    $oldImageName = $_POST['oldImageName'] ?? '';
    if ($oldImageName && $oldImageName !== 'placeholder.jpg' && $oldImageName !== $newImageName && file_exists($uploadDir . $oldImageName)) {
        unlink($uploadDir . $oldImageName);
    }
}

$updateSql = "UPDATE reservations 
              SET name = ?, date = ?, time = ?, guests = ?, location = ?, booked = ?, imageName = ? 
              WHERE id = ? 
              LIMIT 1";

$updateStmt = $con->prepare($updateSql);
$updateStmt->bind_param("sssisisi", $name, $date, $time, $guests, $location, $booked, $newImageName, $id);

if ($updateStmt->execute()) {
    echo json_encode(['message' => 'Reservation updated successfully']);
} else {
    if ($con->errno === 1062) { // Duplicate entry error
        http_response_code(409);
        echo json_encode(['error' => 'Duplicate booking: location, date, and time already booked']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update reservation: ' . $updateStmt->error]);
    }
}
?>
