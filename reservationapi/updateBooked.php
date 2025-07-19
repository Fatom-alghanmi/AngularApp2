<?php
require 'connect.php';
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
$booked = isset($_POST['booked']) ? (int) $_POST['booked'] : 0;

if ($id < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing reservation ID.']);
    exit;
}

$sql = "UPDATE reservations SET booked = $booked WHERE id = $id LIMIT 1";

if (mysqli_query($con, $sql)) {
    http_response_code(200);
    echo json_encode(['message' => 'Booked status updated successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update booked status.']);
}
?>
