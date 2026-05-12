// Scholar's Study Service Worker
// 每次修改文件后，把版本号往上加（v1 → v2 → v3...）强制刷新缓存
const CACHE_NAME = 'scholars-study-v3';

const ASSETS = [
  "./",
  "./index.html",
  "./cosmos.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Serif+SC:wght@300;400;500&display=swap",
  "./G_arch.png",
  "./G_bg.png",
  "./G_bottle_bottom.png",
  "./G_bottle_middle.png",
  "./G_bottle_top.png",
  "./G_cave_painting.png",
  "./G_copper_coin.png",
  "./G_corner_cabinet.png",
  "./G_crown.png",
  "./G_diorama_agriculture.png",
  "./G_diorama_cambrian.png",
  "./G_diorama_dinosaur.png",
  "./G_diorama_oxygen.png",
  "./G_double_cabinet.png",
  "./G_flag.png",
  "./G_flying_machine.png",
  "./G_gold_coin.png",
  "./G_knife_coin.png",
  "./G_left_lamp.png",
  "./G_long_display.png",
  "./G_microscope.png",
  "./G_mona_lisa.png",
  "./G_paper_money.png",
  "./G_shell.png",
  "./G_telescope.png",
  "./G_test_tube_shelf.png",
  "./G_thinker.png",
  "./G_top_lights.png",
  "./G_warfare.png",
  "./G_work_table.png",
  "./L_bg.png",
  "./L_bookshelf.png",
  "./L_celestial.png",
  "./L_chair.png",
  "./L_chandelier.png",
  "./L_desk.png",
  "./L_papers.png",
  "./L_philosophy_book.png",
  "./L_psychology_book.png",
  "./L_sociology_book.png",
  "./L_wall_civilization.png",
  "./L_wall_cosmos.png",
  "./L_wall_earth.png",
  "./L_wall_elements.png",
  "./L_wall_evolution.png",
  "./L_wall_human.png",
  "./L_world_map.png",
  "./board_map_0.png",
  "./board_wall_0.png",
  "./board_wall_1.png",
  "./board_wall_10.png",
  "./board_wall_2.png",
  "./board_wall_3.png",
  "./board_wall_4.png",
  "./board_wall_5.png",
  "./board_wall_6.png",
  "./board_wall_7.png",
  "./board_wall_8.png",
  "./board_wall_9.png",
  "./detail_board_civilization.png",
  "./detail_board_cosmos.png",
  "./detail_board_earth.png",
  "./detail_board_elements.png",
  "./detail_board_human.png",
  "./detail_board_life.png",
  "./detail_board_planet.png",
  "./detail_board_planet_detail.png",
  "./detail_board_stars.png",
  "./detail_board_world_map.png",
  "./detail_bottles.png",
  "./detail_cave_painting.png",
  "./detail_celestial.png",
  "./detail_copper_coin.png",
  "./detail_country_iran.png",
  "./detail_country_portugal.png",
  "./detail_country_spain.png",
  "./detail_country_us.png",
  "./detail_crown.png",
  "./detail_diorama_agriculture.png",
  "./detail_diorama_cambrian.png",
  "./detail_diorama_dinosaur.png",
  "./detail_diorama_oxygen.png",
  "./detail_flag.png",
  "./detail_flying_machine.png",
  "./detail_gold_coin.png",
  "./detail_knife_coin.png",
  "./detail_microscope.png",
  "./detail_mona_lisa.png",
  "./detail_paper_money.png",
  "./detail_philosophy.png",
  "./detail_psychology.png",
  "./detail_shell.png",
  "./detail_sociology.png",
  "./detail_telescope.png",
  "./detail_thinker.png",
  "./detail_warfare.png",
  "./variant_flag_0.png",
  "./variant_flag_1.png"
];

// 安装：把所有资源缓存到本地
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 用 Promise.allSettled，单张图失败不影响整体
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(e => console.warn('缓存失败:', url)))
      );
    })
  );
  self.skipWaiting();
});

// 激活：清掉旧版本缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，缓存里没有再从网络拉
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // 顺便把新拉的也缓存进去
        if (response.ok && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 离线且没缓存，返回个简单错误页
        return new Response('Offline and not cached', {status: 503});
      });
    })
  );
});
