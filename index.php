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

    $response = array(
        'id' => (int)$pdo->lastInsertId()
    );

    echo json_encode($response);
});

$app->post("/variation", function () use ($app, $twig, $pdo) {
    $json = $app->request->getBody();

    $content = json_decode($json, true);

    $statement = $pdo->prepare("INSERT INTO variation (SplitTest_ID, Title, Content) VALUES (:splittest_id, :title, :content)");
    $statement->bindParam(":splittest_id", $content["variation"]["splitTestID"], \PDO::PARAM_INT);
    $statement->bindParam(":title", $content["variation"]["title"], \PDO::PARAM_STR);
    $statement->bindParam(":content", $content["variation"]["content"], \PDO::PARAM_STR);
    $statement->execute();

    $response = array(
        'id' => (int)$pdo->lastInsertId()
    );

    echo json_encode($response);
});

$app->get("/show/variation/:variation_id", function ($variationId) use ($pdo) {

    // Load Variation Content;
    $statement = $pdo->prepare("
      SELECT st.ElementID, v.Content
      FROM variation AS v
      INNER JOIN splittest AS st ON v.SplitTest_ID = st.ID
      WHERE v.ID = :id
    ");
    $statement->bindParam(":id", $variationId, \PDO::PARAM_INT);
    $statement->execute();

    $result = $statement->fetch();

    if (!$result) {
        throw new \Exception("Variation '" . $variationId . "' not found.");
    }

    $doc = phpQuery::newDocumentFileHTML(__DIR__ . "/templates/coolblue-static.html");

    $element = pq($result["ElementID"]);

    $element->html($result["Content"]);

    echo phpQuery::getDocument($doc->getDocumentID());

});

$app->run();
