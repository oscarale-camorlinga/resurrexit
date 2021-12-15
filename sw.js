var cacheName = 'resurrexit-v0.4.1';
var filesToCache = [
	// '/',
	// '/es/',
	// '/en/',
	// '/index.html',
	// '/en/index.html',
	// '/es/index.html',
	// '/en/psalmus.html',
	// '/es/psalmus.html',
	// '/css/styles.css',
	// '/js/main.js',
	// '/js/psalms.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
	console.log('Inside the install handler:', e);
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
	console.log('Inside the fetch handler:', e);
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});
