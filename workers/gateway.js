export default {
    async fetch(request) {
        const url = new URL(request.url);
        const hostname = url.hostname;
        const path = url.pathname + url.search + url.hash;

        const rootDomain = 'couuas.pp.ua';
        const nodes = [
            { id: 'se', name: 'Serv00 Host', desc_en: 'Europe Optimized' },
            { id: 'cf', name: 'Cloudflare Pages', desc_en: 'Global Edge Network' },
            { id: 'vc', name: 'Vercel Edge', desc_en: 'APAC Optimized' },
            { id: 'gh', name: 'GitHub Pages', desc_en: 'Original Mirror' }
        ];

        if (hostname !== rootDomain) return fetch(request);

        const html = `
<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Smart Routing | Optimization</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .dark .skeleton { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 h-full overflow-hidden flex items-center justify-center p-4 transition-colors duration-500">

    <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full"></div>
        <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full"></div>
    </div>

    <div class="w-full max-w-md relative flex flex-col max-h-[92vh]">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 flex flex-col overflow-hidden transition-all duration-300">
            
            <header class="flex items-center gap-4 mb-5 shrink-0">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div class="min-w-0">
                    <h1 class="text-base font-black tracking-tight uppercase leading-tight">Smart Routing</h1>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Path</span>
                        <span class="text-[10px] font-mono text-blue-500 truncate italic font-medium">${path}</span>
                    </div>
                </div>
            </header>

            <div id="node-container" class="space-y-4 overflow-y-auto no-scrollbar py-1">
                ${nodes.map(() => `<div class="h-16 w-full skeleton rounded-2xl opacity-40"></div>`).join('')}
            </div>

            <footer class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div id="status-card" class="flex items-center justify-between">
                    <div class="flex items-center min-w-0">
                        <span class="relative flex h-2 w-2 mr-3 shrink-0">
                            <span id="status-ping" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span id="status-dot" class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <div class="flex flex-col min-w-0 leading-tight">
                            <span id="status-text" class="text-[12px] font-bold text-slate-600 dark:text-slate-300 truncate tracking-tight">Probing network latency...</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-2 shrink-0">
                        <button onclick="location.reload()" class="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-200 active:scale-90 transition-all">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                        <button id="cancel-btn" class="hidden px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black transition-all shadow-md active:scale-95 uppercase">
                            Stop
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    </div>

    <script>
        const nodes = ${JSON.stringify(nodes)};
        const rootDomain = "couuas.pp.ua";
        const currentPath = "${path}";
        let isStopped = false;
        let countdownValue = 3;
        let countdownInterval = null;

        async function probe(node) {
            const start = performance.now();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            try {
                const probeUrl = "https://" + node.id + "." + rootDomain + "/assets/img-dark/ui/avatar.png?t=" + Date.now();
                await fetch(probeUrl, { mode: 'no-cors', cache: 'no-cache', signal: controller.signal });
                clearTimeout(timeout);
                return { ...node, latency: Math.round(performance.now() - start) };
            } catch (e) {
                return { ...node, latency: 9999 };
            }
        }

        async function init() {
            const results = await Promise.all(nodes.map(probe));
            results.sort((a, b) => a.latency - b.latency);

            const container = document.getElementById('node-container');
            container.innerHTML = results.map((n, i) => {
                const isBest = i === 0 && n.latency < 9999;
                const latColor = n.latency < 200 ? 'text-emerald-500' : (n.latency < 500 ? 'text-amber-500' : 'text-slate-400');
                
                return \`
                <div onclick="window.location.href='https://\${n.id}.\${rootDomain}\${currentPath}'" 
                     class="fade-in flex items-center justify-between p-4 bg-white dark:bg-slate-800/40 border \${isBest ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100 dark:border-slate-800'} rounded-2xl cursor-pointer hover:border-blue-400 transition-all shadow-sm group">
                    <div class="flex items-center gap-4 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-500 text-[10px] border border-slate-100 dark:border-slate-800 shrink-0 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600">\${n.id.toUpperCase()}</div>
                        <div class="flex flex-col min-w-0 leading-tight">
                            <span class="text-[14px] font-bold truncate \${isBest ? 'text-blue-600' : ''}">\${n.name} \${isBest ? '⚡' : ''}</span>
                            <span class="text-[10px] text-slate-400 font-semibold truncate uppercase tracking-tighter mt-0.5">\${n.desc_en}</span>
                        </div>
                    </div>
                    <div class="text-right font-mono text-[11px] font-black \${latColor} shrink-0 ml-2">
                        \${n.latency >= 9999 ? 'Timeout' : n.latency + 'ms'}
                    </div>
                </div>\`;
            }).join('');

            const best = results[0];
            const statusText = document.getElementById('status-text');
            const stDot = document.getElementById('status-dot');
            const stPing = document.getElementById('status-ping');
            const btn = document.getElementById('cancel-btn');

            if (best.latency < 9999) {
                btn.classList.remove('hidden');
                statusText.classList.add('text-emerald-600');
                stDot.className = "relative inline-flex rounded-full h-2 w-2 bg-emerald-500";
                stPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";

                const updateUI = () => {
                    statusText.innerHTML = \`Best route found. Diverting in <b>\${countdownValue}</b>s...\`;
                };

                updateUI();
                countdownInterval = setInterval(() => {
                    if (isStopped) return;
                    countdownValue--;
                    if (countdownValue <= 0) {
                        clearInterval(countdownInterval);
                        window.location.replace("https://" + best.id + "." + rootDomain + currentPath);
                    } else {
                        updateUI();
                    }
                }, 1000);

                btn.onclick = () => {
                    isStopped = true;
                    clearInterval(countdownInterval);
                    btn.classList.add('hidden');
                    statusText.innerText = "Manual Selection Active";
                    statusText.className = "text-[12px] font-bold text-slate-500";
                    stDot.className = "relative inline-flex rounded-full h-2 w-2 bg-slate-400";
                    stPing.classList.add('hidden');
                };
            } else {
                statusText.innerText = "All nodes timed out. Select manually.";
                statusText.className = "text-[12px] font-bold text-red-500";
                stDot.className = "relative inline-flex rounded-full h-2 w-2 bg-red-500";
                stPing.classList.add('hidden');
            }
        }
        window.onload = init;
    </script>
</body>
</html>`;

        return new Response(html, { headers: { 'content-type': 'text/html;charset=UTF-8' } });
    }
};