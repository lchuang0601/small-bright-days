const prefix = "small-bright-days:";
const cacheName = prefix + self.registration.scope + ":v1";
const entry = new URL("./index.html",self.registration.scope).href;
const assets = ["./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(
    assets.map(asset=>new Request(new URL(asset,self.registration.scope),{cache:"reload"}))
  )).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  const scopePrefix=prefix+self.registration.scope+":";
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys
    .filter(key=>key.startsWith(scopePrefix) && key!==cacheName)
    .map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.mode!=="navigate" || !event.request.url.startsWith(self.registration.scope)) return;
  event.respondWith(fetch(event.request).catch(async ()=>{
    const cache=await caches.open(cacheName);
    return await cache.match(entry) || Response.error();
  }));
});
