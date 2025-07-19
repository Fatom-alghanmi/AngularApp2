<?php
require 'connect.php';

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST method allowed']);
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$name = mysqli_real_escape_string($con, $_POST['name'] ?? '');
$date = mysqli_real_escape_string($con, $_POST['date'] ?? '');
$time = mysqli_real_escape_string($con, $_POST['time'] ?? '');
$guests = isset($_POST['guests']) ? (int)$_POST['guests'] : 1;
$location = mysqli_real_escape_string($con, $_POST['location'] ?? '');
$booked = isset($_POST['booked']) ? (int)$_POST['booked'] : 0;
$oldImageName = mysqli_real_escape_string($con, $_POST['oldImageName'] ?? '');
$imageName = $oldImageName;

if ($id <= 0 || $name === '' || $date === '' || $time === '' || $location === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields or invalid ID']);
    exit;
}

$uploadDir = __DIR__ . '/uploads/';

// ✅ Prevent duplicate booking (excluding current record)
if ($booked === 1) {
    $stmt = $con->prepare("SELECT id FROM reservations WHERE date=? AND time=? AND location=? AND booked=1 AND id != ? LIMIT 1");
    $stmt->bind_param('sssi', $date, $time, $location, $id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Another reservation is already booked for this date, time, and location.']);
        exit;
    }
    $stmt->close();
}

// ✅ Handle new image upload and prevent duplicate image names
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $newImageOriginalName = basename($_FILES['image']['name']);

    if ($newImageOriginalName !== 'placeholder_100.jpg') {
        $stmtCheck = $con->prepare("SELECT id FROM reservations WHERE imageName = ? AND id != ? LIMIT 1");
        $stmtCheck->bind_param('si', $newImageOriginalName, $id);
        $stmtCheck->execute();
        $stmtCheck->store_result();
        if ($stmtCheck->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Image name already exists in another reservation.']);
            exit;
        }
        $stmtCheck->close();
    }

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = pathinfo($newImageOriginalName, PATHINFO_EXTENSION);
    $uniqueImageName = uniqid('res_', true) . '.' . $ext;
    $destination = $uploadDir . $uniqueImageName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload image.']);
        exit;
    }

    if (!empty($oldImageName) && $oldImageName !== 'placeholder_100.jpg') {
        $oldImagePath = $uploadDir . $oldImageName;
        if (file_exists($oldImagePath)) {
            unlink($oldImagePath);
        }
    }

    $imageName = $uniqueImageName;
}

$sql = "UPDATE reservations SET name=?, date=?, time=?, guests=?, location=?, booked=?, imageName=? WHERE id=? LIMIT 1";
$stmt = $con->prepare($sql);
$stmt->bind_param("sssisisi", $name, $date, $time, $guests, $location, $booked, $imageName, $id);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Reservation updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error]);
}
?>
