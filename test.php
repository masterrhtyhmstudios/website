<?php

require_once '../vendor/autoload.php';

#Twig_Autoloader::register();
#$loader = new Twig_Loader_Filesystem('/var/www/masterrhythm/templates');
#$twig = new Twig_Environment($loader, [ 'strict_variables' => true ]);

$app = new \Slim\App;
$container = $app->getContainer();
$container['view'] = function ($container) {
	$view = new \Slim\Views\Twig('/var/www/masterrhythm/templates', [
		'strict_variables' => true
	]);
	$view->addExtension(new \Slim\Views\TwigExtension(
		$container['router'],
		$container['request']->getUri()
	));
	return $view;
};

#$app->get('/', function ($request, $response, $args) use ($app) {
#	$app->response->headers->set('Content-Type', 'text/plain');
#	return $response->write( print_r($request, true) );
#});

$app->get('/', function ($request, $response, $args) {
	return $this->view->render($response, 'bullshit.html', [

	]);
})->setName('bullshit');

$app->run();
