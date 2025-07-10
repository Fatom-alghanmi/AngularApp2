<?php
require 'connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$id = $_POST['id'] ?? null;
$field = $_POST['field'] ?? null;
$value = $_POST['value'] ?? null;

if (!$id || !$field) {
    http_response_code(400);
    exit;
}

$allowedFields = ['name', 'date', 'time', 'guests', 'location', 'booked'];
if (!in_array($field, $allowedFields)) {
    http_response_code(400);
    exit;
}

// Sanitize inputs
$id = (int)$id;
$field = mysqli_real_escape_string($con, $field);
$value = mysqli_real_escape_string($con, $value);

// For 'booked' convert string to int 0 or 1
if ($field === 'booked') {
    $value = ($value === 'true' || $value === '1') ? 1 : 0;
}

$sql = "UPDATE reservations SET $field = ? WHERE id = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param($field === 'booked' ? "ii" : "si", $value, $id);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Reservation updated']);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error]);
}
?>
