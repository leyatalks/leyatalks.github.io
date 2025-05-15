// 缓存名称，用于区分不同版本的缓存
const CACHE_NAME = 'leya-talks-v1';
const OFFLINE_PAGE = '/leya-fronted/offline.html';

// 需要缓存的资源列表
const urlsToCache = [
  '/leya-fronted/',
  '/leya-fronted/index.html',
  '/leya-fronted/leyalogo.png',
  '/leya-fronted/manifest.json',
  OFFLINE_PAGE
];

// 安装Service Worker时触发的事件
self.addEventListener('install', event => {
  // 确保Service Worker不会在cache初始化完成前被终止
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('已打开缓存');
        return cache.addAll(urlsToCache);
      })
  );
});

// 当Service Worker接收到fetch请求时触发的事件
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到匹配的响应，则返回它
        if (response) {
          return response;
        }

        // 克隆请求，因为请求是一个流，只能使用一次
        const fetchRequest = event.request.clone();

        // 否则，发送网络请求
        return fetch(fetchRequest)
          .then(response => {
            // 检查是否收到了有效的响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应，因为响应是一个流，只能使用一次
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            // 当网络请求失败时，返回离线页面
            console.log('Fetch failed; returning offline page instead.', error);
            
            // 只为导航请求（HTML页面）返回离线页面
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match(OFFLINE_PAGE);
            }
          });
      })
  );
});

// 当新的Service Worker激活时触发的事件，用于清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 