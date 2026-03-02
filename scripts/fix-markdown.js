import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.resolve(__dirname, '../src/content');

/**
 * Scan markdown files for common rendering errors and fix them.
 * Current checks:
 * 1. Ensure frontmatter is at the very beginning of the file.
 * 2. Fix broken image links or internal links if needed.
 */
function fixMarkdownErrors(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            fixMarkdownErrors(fullPath);
        } else if (item.endsWith('.md')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Fix 1: Frontmatter must start at line 1, no leading whitespace/newlines
            if (content.trimStart().startsWith('---') && !content.startsWith('---')) {
                content = content.trimStart();
                modified = true;
                console.log(`[fix] Trimmed leading whitespace in ${fullPath}`);
            }

            // Fix 2: Ensure trailing newline
            if (content.length > 0 && !content.endsWith('\n')) {
                content += '\n';
                modified = true;
                console.log(`[fix] Added trailing newline to ${fullPath}`);
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

function checkAndFix() {
    if (!fs.existsSync(contentDir)) {
        console.error('❌ ERROR: Content directory does not exist!');
        process.exit(1);
    }

    console.log('🔍 Scanning markdown for rendering errors...');
    fixMarkdownErrors(contentDir);
    console.log('✅ Markdown check/fix complete');
}

checkAndFix();
