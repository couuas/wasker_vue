import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

// Create and configure markdown-it instance
const md = new MarkdownIt({
    html: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) { }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

// Override fence rule to add wrapper and copy button
const defaultFence = md.renderer.rules.fence || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = token.info ? md.utils.escapeHtml(token.info).trim() : '';
    const langName = info ? info.split(/\s+/g)[0] : '';

    // Render the original code block
    const rawCode = defaultFence(tokens, idx, options, env, self);

    // Wrap it
    return `<div class="code-wrapper">
                <div class="code-header">
                    <span class="lang-tag">${langName}</span>
                    <button class="copy-btn" data-code="${md.utils.escapeHtml(token.content)}">
                        <i class="far fa-copy"></i> Copy
                    </button>
                </div>
                ${rawCode}
            </div>`;
};

// Table styling rule (optional, can also be done via CSS)
// Ensure tables are responsive
md.renderer.rules.table_open = function () {
    return '<div class="table-responsive"><table class="table table-striped">';
};
md.renderer.rules.table_close = function () {
    return '</table></div>';
};


export default md;
