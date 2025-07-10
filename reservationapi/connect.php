<?php
// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'reservation_system'); 
// Connect to MySQL database
function connect() {
    $connect = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if (mysqli_connect_errno()) {
        die("Failed to connect: " . mysqli_connect_error());
    }

    // Set charset to UTF-8 for proper encoding
    mysqli_set_charset($connect, "utf8");

    return $connect;
}

// Make the connection available globally
$con = connect();
?>