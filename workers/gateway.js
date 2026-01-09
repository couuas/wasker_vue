export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const hostname = url.hostname;
        const path = url.pathname;
        const fullPath = url.pathname + url.search + url.hash;

        // 1. 基础访客信息获取
        const visitorIP = request.headers.get('cf-connecting-ip') || 'Unknown';
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const referer = request.headers.get('referer') || '';
        const cf = request.cf || {};

        const rootDomain = 'couuas.pp.ua';
        // 安全密钥：请确保子站脚本中的 k 参数与之对应
        const LOG_API_KEY = "tricys_secure_log_2026";

        const nodes = [
            { id: 'se', name: 'Serv00 Host', desc_en: 'Europe Optimized' },
            { id: 'cf', name: 'Cloudflare Pages', desc_en: 'Global Edge Network' },
            { id: 'vc', name: 'Vercel Edge', desc_en: 'APAC Optimized' },
            { id: 'gh', name: 'GitHub Pages', desc_en: 'Original Mirror' }
        ];

        // 2. 增强型通知函数
        async function sendNotification(ip, ua, pathStr, cfInfo, source) {
            const botToken = env.TELEGRAM_BOT_TOKEN;
            const chatId = env.TELEGRAM_CHAT_ID;
            if (!botToken || !chatId) return;

            const city = cfInfo.city || 'Unknown City';
            const country = cfInfo.country || 'Global';
            const isp = cfInfo.asOrganization || 'Unknown ISP';
            const asn = cfInfo.asn ? `AS${cfInfo.asn}` : 'N/A';

            // 根据网络类型生成简单的视觉图表（信号条）
            let qualityBar = "⬜⬜⬜⬜⬜";
            if (cfInfo.asOrganization) {
                const org = cfInfo.asOrganization.toLowerCase();
                // 常见的住宅/移动网络视为高信号
                if (/telecom|unicom|mobile|orange|comcast|at&t/.test(org)) qualityBar = "🟩🟩🟩🟩🟩";
                // 云服务商/数据中心视为中等信号
                else if (/google|amazon|cloudflare|digitalocean|akamai/.test(org)) qualityBar = "🟦🟦🟦⬜⬜";
                // 其他视为一般
                else qualityBar = "🟨🟨🟨🟨⬜";
            }

            const payload = {
                chat_id: chatId,
                parse_mode: 'Markdown',
                text: `*📊 Visitor Notification*\n` +
                    `*Source:* \`${source}\`\n` +
                    `*Network:* ${qualityBar}\n\n` +
                    `*IP:* \`${ip}\`\n` +
                    `*ISP:* \`${isp}\` (${asn})\n` +
                    `*Loc:* ${city}, ${country}\n` +
                    `*Path:* \`${pathStr}\`\n` +
                    `*UA:* \`${ua.substring(0, 40)}...\``
            };

            try {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (e) { console.error("TG Notify Failed", e); }
        }

        // --- 逻辑分发 1: 统计 API 接口 ---
        if (path === '/api/log') {
            const clientKey = url.searchParams.get('k');
            // 校验逻辑：Header 包含域名 或 参数包含正确密钥
            const isAuth = referer.includes(rootDomain) || clientKey === LOG_API_KEY;

            if (!isAuth) {
                return new Response(`Access Denied: Header/Key missing`, { status: 403 });
            }

            // CORS 预检处理
            if (request.method === 'OPTIONS') {
                return new Response(null, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                });
            }

            const sourceSite = url.searchParams.get('s') || 'External Subdomain';
            const innerPath = url.searchParams.get('p') || '/';

            ctx.waitUntil(sendNotification(visitorIP, userAgent, innerPath, cf, sourceSite));

            return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        // --- 逻辑分发 2: 主入口导航页 ---
        if (hostname === rootDomain) {
            ctx.waitUntil(sendNotification(visitorIP, userAgent, fullPath, cf, "Entrance Portal"));

            const html = `
<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Smart Routing | Hub</title>
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

    <div class="w-full max-w-md relative flex flex-col max-h-[94vh]">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 flex flex-col overflow-hidden">
            
            <header class="flex items-center gap-4 mb-5 shrink-0 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div class="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div class="min-w-0">
                    <h1 class="text-base font-black tracking-tight uppercase leading-tight">Smart Routing</h1>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0 italic">Path:</span>
                        <span class="text-[10px] font-mono text-blue-500 truncate italic font-medium">${fullPath}</span>
                    </div>
                </div>
            </header>

            <div id="node-container" class="space-y-4 overflow-y-auto no-scrollbar py-1">
                ${nodes.map(() => `<div class="h-16 w-full skeleton rounded-2xl opacity-40"></div>`).join('')}
            </div>

            <footer class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div id="status-card" class="flex items-center justify-between mb-4 px-1">
                    <div class="flex items-center min-w-0">
                        <span class="relative flex h-2 w-2 mr-3 shrink-0">
                            <span id="status-ping" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span id="status-dot" class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span id="status-text" class="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Probing Node Latency...</span>
                    </div>
                    <button onclick="location.reload()" class="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg hover:text-blue-500 transition-colors"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                </div>

                <div class="flex flex-col items-center gap-1 py-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <span class="text-[11px] font-mono font-black text-slate-600 dark:text-slate-300 tracking-tight">${visitorIP}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">${cf.asOrganization || 'ISP Provider'}</span>
                </div>
            </footer>
        </div>
    </div>

    <script>
        const nodes = ${JSON.stringify(nodes)};
        const rootDomain = "${rootDomain}";
        const currentPath = "${fullPath}";
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
                        <div class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-500 text-[10px] border border-slate-100 dark:border-slate-800 shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600">\${n.id.toUpperCase()}</div>
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

            if (best.latency < 9999) {
                statusText.classList.add('text-emerald-600');
                stDot.className = "relative inline-flex rounded-full h-2 w-2 bg-emerald-500";
                stPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";

                const updateUI = () => {
                    statusText.innerHTML = \`Redirecting in <span class="text-emerald-600 font-black">\${countdownValue}</span>s...\`;
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
            } else {
                statusText.innerText = "Check Connection";
                statusText.className = "text-[11px] font-bold text-red-500 uppercase";
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

        // --- 逻辑分发 3: 默认透传 ---
        return fetch(request);
    }
};