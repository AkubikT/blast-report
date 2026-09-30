const V='blast-v2',CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'],
EXT=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(async c=>{await c.addAll(CORE);await Promise.all(EXT.map(u=>fetch(new Request(u,{mode:'no-cors'})).then(r=>c.put(u,r)).catch(()=>{})))}).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!='GET')return;
 const isPage=e.request.mode=='navigate'||e.request.url.endsWith('/')||e.request.url.endsWith('index.html');
 if(isPage){
  // Page shell: prefer the newest version when online; fall back to the offline copy when there's no signal.
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||caches.match('./index.html'))));
  return;
 }
 // Static assets (icons, manifest, the PDF library): offline-first, refreshed quietly in the background.
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
  const net=fetch(e.request).then(r=>{if(r.ok||r.type=='opaque'){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r}).catch(()=>hit);
  return hit||net}))});
