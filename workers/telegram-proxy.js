export default {
    async fetch(request, env) {
        // Upgrade to HTTPS
        const url = new URL(request.url);
        if (url.protocol === 'http:') {
            url.protocol = 'https:';
            return Response.redirect(url.toString(), 301);
        }

        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
        }

        try {
            const body = await request.json();
            const { name, email, subject, message } = body;

            if (!name || !email || !message) {
                return new Response('Missing required fields', { status: 400, headers: corsHeaders });
            }

            // Enhanced HTML Message
            const text = `
<b>📩 New Inquiry Received</b>

<b>👤 Name:</b> <code>${name.replace(/</g, '&lt;')}</code>
<b>📧 Email:</b> <code>${email.replace(/</g, '&lt;')}</code>
<b>💡 Subject:</b> <i>${(subject || 'No Subject').replace(/</g, '&lt;')}</i>

<b>📝 Message:</b>
<pre>${message.replace(/</g, '&lt;')}</pre>
      `.trim();

            const botToken = env.TELEGRAM_BOT_TOKEN;
            const chatId = env.TELEGRAM_CHAT_ID;

            if (!botToken || !chatId) {
                return new Response('Server Configuration Error', { status: 500, headers: corsHeaders });
            }

            const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const telegramResponse = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML' // Enable HTML parsing
                }),
            });

            const telegramData = await telegramResponse.json();

            if (!telegramData.ok) {
                console.error('Telegram Error:', telegramData);
                return new Response('Failed to forwarded message', { status: 502, headers: corsHeaders });
            }

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });

        } catch (err) {
            console.error(err);
            return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
        }
    },
};
