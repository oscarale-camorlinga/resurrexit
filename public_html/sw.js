var cacheName = 'resurrexit-v01';
var filesToCache = [
	'/',
	'/es/',
	'/en/',
	'/index.html',
	'/es/index.html',
	'/es/psalmis.html',
	'/es/psalmis.json',
	'/en/index.html',
	'/en/psalmis.html',
	'/en/psalmis.json',
	'/css/styles.css',
	'/js/main.js',
	'/js/search.js',
	'/js/player.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', (event) => {
	//console.log('Inside the install handler:', event);
	event.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', (event) => {
	//console.log('Inside the activate handler:', event);
});

/* Serve cached content when offline */
self.addEventListener('fetch', (event) => {
	//console.log('Inside the fetch handler:', event);
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});
