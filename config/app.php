<?php
$applicationConfiguration = array();

/**
 * Application Configuration
 */
$applicationConfiguration["debugMode"] = true;


/**
 * Database configuration.
 */
try {
    $applicationConfiguration["pdo"] = new \PDO(
        "mysql:host=192.168.43.76;dbname=splittest",
        "coolblue",
        "password",
        array(
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'UTF8'",
            \PDO::ATTR_ORACLE_NULLS       => \PDO::NULL_EMPTY_STRING,
        )
    );
} catch (\Exception $e) {
    $applicationConfiguration["pdo"] = false;
}

/**
 * Twig template system.
 */
$loader = new \Twig_Loader_Filesystem(__DIR__ . "/../templates/");
$applicationConfiguration["twig"] = new \Twig_Environment($loader, array(
    "cache" => __DIR__ . "/../cache/",
));

return $applicationConfiguration;
