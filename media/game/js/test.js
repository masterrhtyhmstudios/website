var data = document.getElementsByClassName('metadata');
var images = document.getElementsByClassName('lazy-loaded');
var figures = document.getElementsByTagName('figure');

for (var i = 0; i < data.length; i++) {
if (data[i].innerHTML.indexOf('Sponsored') > -1) {
	data[i].style.display = 'none';
	images[i].style.display = 'none';
	figures[i].style.display = 'none';
}

}