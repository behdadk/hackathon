<?php

date_default_timezone_set ("Europe/Amsterdam");

require_once(__DIR__ . "/vendor/autoload.php");

use Zend\Dom\Document\Query;

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
            "host" => "http://hackathon2015.coolblue/external/".urlencode("www.pdashop.nl"),
            "url" => "www.coolblue.nl"
        ]
    );
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

$app->get("/show/external/variation/:variation_id", function () use($pdo) {

    // Load Variation Content;
    $statement = $pdo->prepare("
      SELECT st.URL, st.ElementID, v.Content
      FROM variation AS v
      INNER JOIN splittest AS st ON v.SplitTest_ID = st.ID
      WHERE v.ID = :id
    ");
    $statement->bindParam(":id", $variationId, \PDO::PARAM_INT);
    $statement->execute();


    $client = new GuzzleHttp\Client([]);

    $response = $client->request('GET', "http://www.coolblue.nl");
    $contentBody = $response->getBody();



    $result = $statement->fetch();




//    $document = new Zend\Dom\Document($contentBody);
//    $dom = new Query();
//    $result = $dom->execute('//*[@id="js-footer"]/div[1]/div/div/div/div[2]/ul/li[1]/a', $document);

    print '<pre>';

    /** @var Zend\Dom\Document\NodeList $result */
    /** @var DOMElement $r */

//    $result->offsetSet(0, new DOMElement("h1", "BLAH"));
    libxml_use_internal_errors(true);
//        print htmlqp($contentBody->getContents(), '//*[@id="js-footer"]/div[1]/div/div/div/div[2]/ul/li[1]/a');
    $x = new QueryPath\DOMQuery($contentBody->getContents());
    $a = $x->xpath('//*[@id="js-footer"]/div[1]/div/div/div/div[2]/ul/li[3]/a/span[2]/strong');

    print_r($a->f);

//    print $document->getStringDocument();

});

$app->run();
