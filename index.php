<?php
require_once(__DIR__ . "/vendor/autoload.php");
$config = include(__DIR__ . "/config/app.php");

$app = new \Slim\Slim();
$app->config("debug", $config["debugMode"]);
$app->config("config", $config);


$app->get('/', function () use ($app) {
    /** @var \Twig_Environment $twig */
    $twig = $app->config("config")["twig"];

    /** @var \PDO $pdo */
    /*$pdo = $app->config("config")["pdo"];
    $statement = $pdo->prepare("SHOW TABLES;");
    $statement->execute();
    $result = $statement->fetchAll();
    var_dump($result);*/


    $template = $twig->loadTemplate('coolblue-static.html');
    echo $template->render(array());
});

$app->run();
