export default {
    async fetch(request) {
        const url = new URL(request.url);
        const hostname = url.hostname;
        const path = url.pathname + url.search + url.hash;

        // --- 配置区域 ---
        const rootDomain = 'couuas.pp.ua';
        const nodes = [
            { id: 'cf', name: 'Cloudflare Pages', desc_cn: '全球边缘网络', desc_en: 'Global Edge Network' },
            { id: 'vc', name: 'Vercel Edge', desc_cn: '亚太路由优化', desc_en: 'APAC Optimized' },
            { id: 'gh', name: 'GitHub Pages', desc_cn: '原始镜像仓库', desc_en: 'Original Mirror' }
        ];

        // 如果访问的是子域名，直接放行
        if (hostname !== rootDomain) {
            return fetch(request);
        }

        // 主域名返回网关页面
        const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>智能优选 | Smart Routing</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
          .dark .skeleton { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 200% 100%; }
          .fade-in { animation: fadeIn 0.5s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          body { font-family: system-ui, -apple-system, sans-serif; }
      </style>
  </head>
  <body class="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-6">
  
      <div class="w-full max-w-lg relative">
          <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 overflow-hidden">
              
              <header class="text-center mb-10">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg mb-6">
                      <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h1 class="text-2xl font-black tracking-tight flex flex-col gap-1">
                      <span>智能线路优选</span>
                      <span class="text-slate-400 text-sm font-medium tracking-normal uppercase">Smart Routing Optimization</span>
                  </h1>
                  <p class="mt-4 text-[10px] font-mono text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block truncate max-w-full">${path}</p>
              </header>
  
              <div id="node-container" class="space-y-4">
                  ${nodes.map(() => `<div class="h-20 w-full skeleton rounded-2xl opacity-50"></div>`).join('')}
              </div>
  
              <div class="mt-10 flex flex-col items-center">
                  <div id="status-area" class="flex items-center space-x-3 mb-6">
                      <span class="relative flex h-3 w-3">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span id="status-dot" class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                      <div class="flex flex-col">
                          <span id="status-cn" class="text-sm font-bold text-slate-600 dark:text-slate-300">正在探测节点延迟...</span>
                          <span id="status-en" class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Probing network latency...</span>
                      </div>
                  </div>
                  
                  <div class="flex gap-3">
                      <button onclick="location.reload()" class="px-5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-all">RETEST</button>
                      <button id="cancel-btn" class="hidden px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-lg transition-all">STOP JUMP</button>
                  </div>
              </div>
          </div>
      </div>
  
      <script>
          const nodes = ${JSON.stringify(nodes)};
          const rootDomain = "${rootDomain}";
          const currentPath = "${path}";
          let isStopped = false;
  
          // 核心修复：带有硬超时的探测函数
          async function probeNode(node) {
              const start = performance.now();
              const controller = new AbortController();
              
              // 2.5秒强制超时
              const timeoutId = setTimeout(() => controller.abort(), 2500);
  
              try {
                  // 探测子域名的 favicon
                  await fetch("https://" + node.id + "." + rootDomain + "/favicon.ico?t=" + Date.now(), { 
                      mode: 'no-cors', 
                      cache: 'no-cache',
                      signal: controller.signal 
                  });
                  clearTimeout(timeoutId);
                  const latency = Math.round(performance.now() - start);
                  return { ...node, latency };
              } catch (e) {
                  console.warn("Node " + node.id + " failed or timed out");
                  return { ...node, latency: 9999 };
              }
          }
  
          async function init() {
              console.log("Initialization started...");
              
              // 并发探测所有节点
              const results = await Promise.all(nodes.map(probeNode));
              results.sort((a, b) => a.latency - b.latency);
  
              // 渲染结果
              const container = document.getElementById('node-container');
              container.innerHTML = results.map((n, i) => {
                  const isBest = i === 0 && n.latency < 9999;
                  const latColor = n.latency < 250 ? 'text-emerald-500' : (n.latency < 600 ? 'text-amber-500' : 'text-slate-400');
                  
                  return \`
                  <div onclick="window.location.href='https://\${n.id}.\${rootDomain}\${currentPath}'" 
                       class="fade-in flex items-center justify-between p-4 bg-white dark:bg-slate-800 border \${isBest ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-100 dark:border-slate-800'} rounded-2xl cursor-pointer hover:border-blue-400 transition-all">
                      <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-400">\${n.id.toUpperCase()}</div>
                          <div class="flex flex-col">
                              <span class="text-sm font-bold \${isBest ? 'text-blue-600' : ''}">\${n.name} \${isBest ? '⚡' : ''}</span>
                              <span class="text-[10px] text-slate-400 font-medium opacity-80">\${n.desc_cn} / \${n.desc_en}</span>
                          </div>
                      </div>
                      <div class="text-right font-mono text-xs font-black \${latColor}">
                          \${n.latency >= 9999 ? 'TIMEOUT' : n.latency + 'ms'}
                      </div>
                  </div>\`;
              }).join('');
  
              const best = results[0];
              const statusCn = document.getElementById('status-cn');
              const statusEn = document.getElementById('status-en');
              const statusDot = document.getElementById('status-dot');
              const cancelBtn = document.getElementById('cancel-btn');
  
              if (best.latency < 9999) {
                  statusCn.innerText = "已匹配最优线路，3秒后自动接入";
                  statusEn.innerText = "Optimal route found, jumping in 3s";
                  statusCn.classList.add('text-emerald-500');
                  statusDot.classList.replace('bg-blue-500', 'bg-emerald-500');
                  cancelBtn.classList.remove('hidden');
  
                  const jumpTimer = setTimeout(() => {
                      if (!isStopped) window.location.replace("https://" + best.id + "." + rootDomain + currentPath);
                  }, 3000);
  
                  cancelBtn.onclick = () => {
                      isStopped = true;
                      cancelBtn.classList.add('hidden');
                      statusCn.innerText = "自动跳转已取消";
                      statusEn.innerText = "Automatic jump cancelled";
                      statusCn.classList.replace('text-emerald-500', 'text-slate-500');
                      statusDot.classList.replace('bg-emerald-500', 'bg-slate-400');
                  };
              } else {
                  statusCn.innerText = "所有节点探测失败";
                  statusEn.innerText = "All nodes connection failed";
                  statusDot.classList.replace('bg-blue-500', 'bg-red-500');
              }
          }
  
          window.onload = init;
      </script>
  </body>
  </html>`;

        return new Response(html, {
            headers: { 'content-type': 'text/html;charset=UTF-8' },
        });
    },
};