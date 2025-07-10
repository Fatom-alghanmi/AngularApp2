<?php
require 'connect.php';

// Use POST request and sanitize input
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid ID']);
    exit;
}

// Optional: fetch imageName to delete file (if any), adjust table/field names accordingly
$query = "SELECT imageName FROM reservations WHERE id = ?";
$stmt = $con->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
if ($result && $row = $result->fetch_assoc()) {
    if (!empty($row['imageName']) && $row['imageName'] !== 'placeholder_100.jpg') {
        $imagePath = __DIR__ . "/uploads/" . $row['imageName'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
} 

// Delete reservation
$sql = "DELETE FROM reservations WHERE id = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(['message' => 'Reservation deleted successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete reservation']);
}
?>
