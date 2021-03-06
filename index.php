<?php

date_default_timezone_set("Europe/Amsterdam");

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
    $template = $twig->loadTemplate('topBar/topbar.html');
    echo $template->render(
        [
            "host" => "http://hackathon2015.coolblue/external/" . urlencode("www.pdashop.nl"),
            "url"  => "www.pdashop.nl"
        ]
    );
});

$app->get('/stats', function () use ($app, $twig) {
    $template = $twig->loadTemplate('stats.html');
    echo $template->render([]);
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

$app->get("/variation/:url/:elementid", function ($url, $elementID) use ($pdo) {
    $statement = $pdo->prepare("
        SELECT st.ID AS splitTestID, v.ID AS variationID, v.Content AS content
        FROM variation AS v
        INNER JOIN splittest AS st ON v.SplitTest_ID = st.ID
        WHERE st.URL = :url
          AND st.ElementID = :element_id
    ");
    $statement->bindParam(":url", $url, \PDO::PARAM_STR);
    $statement->bindParam(":element_id", $elementID, \PDO::PARAM_STR);
    $statement->execute();

    $result = $statement->fetchAll();

    $response = array();
    foreach ($result as $variation) {
        $response[] = array(
            "splitTestID" => $variation["splitTestID"],
            "variationID" => $variation["variationID"],
            "content"     => $variation["content"],
        );
    }

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

$app->get("/splittest", function () use ($app, $twig, $pdo) {
    $app->request->get("");
});

$app->get("/external/:url", function ($url) {

    $style = '<link rel="stylesheet" href="/templates/lib/splittester/splittester.css" type="text/css"/>';
    $js = '<script src="/templates/lib/jquery-modal/jquery.modal.min.js"></script>';
    $js .= '<script src="/templates/lib/splittester/splittester.js"></script>';

    $client = new GuzzleHttp\Client([]);

    $response = $client->request('GET', $url);
    $contentBody = $response->getBody();

    $contentBody = preg_replace("/<head(.*?)>/", "<head$1>$style", $contentBody);
    $contentBody = preg_replace("/<\\/html>/", "$js</html>", $contentBody);

    print $contentBody;

});


$app->get("/replace/:variation_id", function ($variation_id) use ($pdo, $app) {

    $statement = $pdo->prepare("
      SELECT st.ElementID, v.Content, st.URL
      FROM variation AS v
      INNER JOIN splittest AS st ON v.SplitTest_ID = st.ID
      WHERE v.ID = :id
    ");

    $statement->bindParam(":id", $variation_id, \PDO::PARAM_INT);
    $statement->execute();

    $result = $statement->fetchAll();

    if (count($result) == 0) {
        $app->notFound();
        return;
    }

    $result = $result[0];
    $hostUrl = $result["URL"];
    $htmlContent = $result["Content"];
    $xpath = $result["ElementID"];

    $client = new GuzzleHttp\Client([]);

    $response = $client->request('GET', $hostUrl, ['allow_redirects' => true]);
    $contentBody = $response->getBody();

    libxml_use_internal_errors(true);
    $html = new \QueryPath\DOMQuery($htmlContent);
    $page = new \QueryPath\DOMQuery($contentBody->getContents());

    $domQuery = $page->xpath($xpath);
    $domQuery->replaceWith($html);

    $domQuery->writeHTML();
});

$app->run();
