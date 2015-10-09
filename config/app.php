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
        "mysql:host=localhost;dbname=splittest",
        "root",
        "root",
        array(
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'UTF8'",
            \PDO::ATTR_ORACLE_NULLS       => \PDO::NULL_EMPTY_STRING,
        )
    );
} catch (\Exception $e) {
//    print_r($e);
}

/**
 * Twig template system.
 */
$loader = new \Twig_Loader_Filesystem(__DIR__ . "/../templates/");
$applicationConfiguration["twig"] = new \Twig_Environment($loader,[]);

return $applicationConfiguration;
