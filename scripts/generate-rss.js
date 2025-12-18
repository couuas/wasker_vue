import fs from 'fs';
import path from 'path';
import fm from 'front-matter';
import { fileURLToPath } from 'url';

// Configuration
const SITE_URL = 'https://wasker.netlify.app'; // Replace with actual site URL
const SITE_TITLE = 'Wasker - Portfolio & Blog';
const SITE_DESCRIPTION = 'Personal portfolio and blog of a creative designer/developer.';
const CONTENT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/blog');
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'rss.xml');

// Recursive function to get all markdown files
function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            if (file.endsWith('.md')) {
                results.push(file);
            }
        }
    });
    return results;
}

// Generate RSS Item
function generateItem(post) {
    return `
    <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${SITE_URL}/blog/${post.slug}</link>
        <guid>${SITE_URL}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <description><![CDATA[${post.description || ''}]]></description>
        <category>${post.category}</category>
    </item>`;
}

async function generateRSS() {
    console.log('Generating RSS feed...');

    const files = getFiles(CONTENT_DIR);
    const posts = [];

    files.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = fm(content);
        const attributes = parsed.attributes;

        // Logic to derive slug and category (Mirroring useMarkdown.js)
        const relativePath = path.relative(CONTENT_DIR, filePath); // e.g., 'Code/js.md' or 'post.md'
        const filename = path.basename(filePath, '.md');

        let category = attributes.category || 'General';

        // Start from folder name if available
        const pathParts = relativePath.split(path.sep);
        if (pathParts.length > 1) {
            const folderName = pathParts[0];
            // Simple capitalization
            category = folderName.charAt(0).toUpperCase() + folderName.slice(1);
        }

        posts.push({
            title: attributes.title,
            date: attributes.date ? new Date(attributes.date) : new Date(),
            description: attributes.description,
            category: category,
            slug: filename,
            image: attributes.image
        });
    });

    // Sort by date descending
    posts.sort((a, b) => b.date - a.date);

    const rssContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts.map(generateItem).join('')}
</channel>
</rss>`;

    // Ensure public dir exists
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR);
    }

    fs.writeFileSync(OUTPUT_FILE, rssContent);
    console.log(`RSS feed generated at ${OUTPUT_FILE}`);
}

generateRSS();
