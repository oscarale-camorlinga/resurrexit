var cacheName = 'resurrexit-v0.4.7';
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

const broadcaster = new BroadcastChannel("sw-messages");

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
	console.log('SW: Installing:', e);
	broadcaster.postMessage(cacheName);
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
	console.log('SW: Fetching:', e);
	broadcaster.postMessage(cacheName);
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});
