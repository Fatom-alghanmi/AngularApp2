<?php
require 'connect.php';
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$id = isset($_POST['id']) ? (int) $_POST['id'] : 0; // unused here but ok
$booked = isset($_POST['booked']) ? (int)$_POST['booked'] : 0;

$name = $_POST['name'] ?? '';
$date = $_POST['date'] ?? '';
$time = $_POST['time'] ?? '';
$guests = isset($_POST['guests']) ? (int)$_POST['guests'] : 0;
$location = $_POST['location'] ?? '';
$imageName = 'placeholder_100.jpg';  // default placeholder

// Validate required fields
if (!$name || !$date || !$time || !$guests || !$location) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Prevent duplicate reservation (same name, date, time, guests)
$checkSql = "SELECT id FROM reservations WHERE name = ? AND date = ? AND time = ? AND guests = ? LIMIT 1";
$checkStmt = $con->prepare($checkSql);
$checkStmt->bind_param("sssi", $name, $date, $time, $guests);
$checkStmt->execute();
$checkStmt->store_result();
if ($checkStmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Duplicate reservation detected.']);
    exit;
}
$checkStmt->close();

// === New check: Prevent duplicate booked reservation at same location/date/time ===
if ($booked === 1) {
    $dupSql = "SELECT id FROM reservations WHERE location = ? AND date = ? AND time = ? AND booked = 1 LIMIT 1";
    $dupStmt = $con->prepare($dupSql);
    $dupStmt->bind_param("sss", $location, $date, $time);
    $dupStmt->execute();
    $dupStmt->store_result();
    if ($dupStmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Another reservation is already booked for this location, date, and time.']);
        exit;
    }
    $dupStmt->close();
}
// ======================================================================

// Handle image upload
if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
    $uploadDir = __DIR__ . '/uploads/';
    $originalImageName = basename($_FILES['image']['name']);

    if ($originalImageName !== 'placeholder_100.jpg') {
        // Prevent duplicate image by original filename
        $stmt = $con->prepare("SELECT id FROM reservations WHERE imageName = ? LIMIT 1");
        $stmt->bind_param('s', $originalImageName);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Duplicate image name detected.']);
            exit;
        }
        $stmt->close();
    }

    // Save image using original filename
    $imagePath = $uploadDir . $originalImageName;
    if (move_uploaded_file($_FILES['image']['tmp_name'], $imagePath)) {
        $imageName = $originalImageName;
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save image.']);
        exit;
    }
}

// Insert reservation
$sql = "INSERT INTO reservations (name, date, time, guests, location, imageName, booked)
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("sssissi", $name, $date, $time, $guests, $location, $imageName, $booked);

if ($stmt->execute()) {
    echo json_encode([
        'message' => 'Reservation added successfully',
        'id' => $stmt->insert_id,
        'imageName' => $imageName
    ]);
} else {
    if ($con->errno === 1062) { // Duplicate entry error
        http_response_code(409);
        echo json_encode(['error' => 'Duplicate booking: location, date, and time already booked']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $stmt->error]);
    }
}
?>
