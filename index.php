<?php
require_once(__DIR__ . "/vendor/autoload.php");
$config = include(__DIR__ . "/config/app.php");

$app = new \Slim\Slim();
$app->config("debug", $config["debugMode"]);
$app->config("config", $config);

/** @var \Twig_Environment $twig */
$twig = $app->config("config")["twig"];
/** @var \PDO $pdo */
$pdo = $app->config("config")["pdo"];

$app->get('/', function () use ($app, $twig) {
    $template = $twig->loadTemplate('coolblue-static.html');
    echo $template->render(array());
});

$app->post("/splittest", function () use ($app, $twig, $pdo) {
    $json = $app->request->getBody();

    $content = json_decode($json, true);

    $statement = $pdo->prepare("INSERT INTO splittest (URL, ElementID) VALUES (:url, :element_id)");
    $statement->bindParam(":url", $content["splittest"]["url"], \PDO::PARAM_STR);
    $statement->bindParam(":element_id", $content["splittest"]["elementID"], \PDO::PARAM_STR);
    $statement->execute();

    echo json_encode($pdo->lastInsertId());
});

$app->run();
