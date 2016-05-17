<?php

require_once '../vendor/autoload.php';
Twig_Autoloader::register();

$template_dir = '/var/www/masterrhythm/templates';
$loader = new Twig_Loader_Filesystem($template_dir);
$twig = new Twig_Environment($loader, [ 'strict_variables' => true ]);

# TODO: Discern template path from request path instead
$script_path = $_SERVER['SCRIPT_FILENAME'];
if (! preg_match('/^\/var\/www\/masterrhythm\/public\/(.+)\.php$/', $script_path, $matches)) {
	error_404();
}

$template = $matches[1] . '.html';
if (preg_match('/^(.+)\//', $template, $matches)) {
	$template_hier = explode('/', $matches[1]);
	$title = join('/', array_map(function($x) {
		return ucfirst($x);
	}, $template_hier));
} else {
	$title = 'Home';
}

if (is_file("$template_dir/$template")) {
	try {
		echo $twig->render($template, [ 'title' => $title ]);
	} catch (Exception $e) {
		header('Content-Type: text/plain');
		print_r($e);
	}
} else {
	error_404();
}

function error_404() {
	header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
}
