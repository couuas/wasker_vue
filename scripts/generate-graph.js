import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force-3d';

const contentDir = path.resolve('src/content');
const outputFile = path.resolve('public/galaxy-data.json');

async function generateGraph() {
    console.log('Generating knowledge graph...');

    // Restrict scan to 'page' and 'portfolio' directories
    const pageFiles = await glob(`${contentDir}/blog/**/*.md`);
    const portfolioFiles = await glob(`${contentDir}/portfolio/**/*.md`);
    const files = [...pageFiles, ...portfolioFiles];

    const nodes = [];
    const links = [];
    const idMap = new Map(); // Map file path to node ID

    // 1. First pass: Create nodes
    files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        const { data } = matter(content);

        // Normalize path
        const relativePath = path.relative(contentDir, file).replace(/\\/g, '/');

        // Determine Language
        let lang = 'zh';
        if (relativePath.includes('/en/')) lang = 'en';
        else if (relativePath.includes('/zh/')) lang = 'zh';

        // Extract basic ID components
        // file path: blog/zh/post.md OR blog/post.md
        // We want a clean ID: lang/type/slug

        const pathParts = relativePath.split('/');

        // Find type
        const isBlog = relativePath.includes('blog/');
        const isPortfolio = relativePath.includes('portfolio/');
        // If neither, maybe 'profile' or 'friend'

        let type = 'other';
        if (isBlog) type = 'blog';
        else if (isPortfolio) type = 'portfolio';
        else if (pathParts[0]) type = pathParts[0];

        const slug = pathParts[pathParts.length - 1].replace('.md', '');

        // New ID format: lang/type/slug
        // e.g. zh/blog/post-a
        const id = `${lang}/${type}/${slug}`;

        idMap.set(relativePath, id);

        nodes.push({
            id: id,
            slug: slug,
            type: type,
            lang: lang, // Add lang property
            name: data.title || slug,
            category: data.category || 'Uncategorized',
            val: 1, // Base weight
            desc: data.description || '',
            filePath: relativePath
        });
    });

    // 2. Second pass: Create links and calculate weights
    files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        const wikiLinkRegex = /\[\[(.*?)\]\]/g;
        const mdLinkRegex = /\[.*?\]\((.*?)\)/g;

        const sourcePath = path.relative(contentDir, file).replace(/\\/g, '/');
        const sourceId = idMap.get(sourcePath);

        if (!sourceId) return;

        const sourceNode = nodes.find(n => n.id === sourceId);
        const sourceLang = sourceNode ? sourceNode.lang : 'zh';

        // Helper to add link
        const addLink = (targetNode) => {
            if (targetNode && targetNode.id !== sourceId) {
                // Prevent duplicate links
                const exists = links.some(l => l.source === sourceId && l.target === targetNode.id);
                if (!exists) {
                    links.push({ source: sourceId, target: targetNode.id });
                    targetNode.val += 1;
                }
            }
        };

        // Process Wiki Links
        let match;
        while ((match = wikiLinkRegex.exec(content)) !== null) {
            const targetRef = match[1];

            // Try to find target node
            // 1. Exact match on title/slug/id AND same language
            let targetNode = nodes.find(n =>
                n.lang === sourceLang &&
                (n.name === targetRef || n.slug === targetRef || n.id === targetRef)
            );

            // 2. Fallback to any language if not found (optional, maybe not desired?)
            // If user wants strict separation, we shouldn't link cross-lang unless explicit.
            // Let's stick to same language preference, but if only one exists (e.g. term definition), maybe fallback?
            // "Cross-reference logic... links usually point to wrong language" -> enforce same lang.

            if (targetNode) {
                addLink(targetNode);
            }
        }

        // Process Standard Links
        while ((match = mdLinkRegex.exec(content)) !== null) {
            let linkPath = decodeURIComponent(match[1]);
            let targetNode = null;

            // Resolve path relative to current file
            if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
                const absoluteLinkPath = path.resolve(path.dirname(file), linkPath);
                const relativeLinkPath = path.relative(contentDir, absoluteLinkPath).replace(/\\/g, '/');
                const targetId = idMap.get(relativeLinkPath);
                if (targetId) {
                    targetNode = nodes.find(n => n.id === targetId);
                }
            }
            // Absolute path in source (e.g. /blog/slug)
            else if (linkPath.startsWith('/')) {
                // Need to guess the node from URL path
                // /blog/slug -> type: blog, slug: slug. Lang: match source.
                const parts = linkPath.split('/').filter(Boolean);
                if (parts.length >= 2) {
                    const type = parts[0]; // 'blog' or 'portfolio'
                    const slug = parts[parts.length - 1]; // 'slug'

                    targetNode = nodes.find(n => n.type === type && n.slug === slug && n.lang === sourceLang);
                }
            }

            addLink(targetNode);
        }
    });

    // 3. Third pass: Pre-calculate 3D physics coordinates
    console.log(`Running 3D physics simulation...`);

    // To ensure language-agnostic POV, we run simulation on "virtual nodes" 
    // where translations share the same physical entity.
    const virtualMap = new Map();
    nodes.forEach(n => {
        const vId = `${n.type}/${n.slug}`;
        if (!virtualMap.has(vId)) {
            virtualMap.set(vId, { id: vId, langVariants: [] });
        }
        virtualMap.get(vId).langVariants.push(n);
    });

    const vNodes = Array.from(virtualMap.values()).map(v => ({ id: v.id }));
    const vLinks = [];
    const processedVLinks = new Set();

    links.forEach(l => {
        const sourceNode = nodes.find(n => n.id === l.source);
        const targetNode = nodes.find(n => n.id === l.target);
        if (sourceNode && targetNode) {
            const vSourceId = `${sourceNode.type}/${sourceNode.slug}`;
            const vTargetId = `${targetNode.type}/${targetNode.slug}`;
            const vLinkId = `${vSourceId}->${vTargetId}`;
            if (vSourceId !== vTargetId && !processedVLinks.has(vLinkId)) {
                vLinks.push({ source: vSourceId, target: vTargetId });
                processedVLinks.add(vLinkId);
            }
        }
    });

    const simulation = forceSimulation(vNodes, 3)
        .force('link', forceLink(vLinks).id(d => d.id).distance(60))
        .force('charge', forceManyBody().strength(-120))
        .force('center', forceCenter(0, 0, 0))
        .stop();

    // Run simulation synchronously
    for (let i = 0; i < 300; i++) {
        simulation.tick();
    }

    // Map virtual coordinates back to all language variants
    vNodes.forEach(v => {
        const variants = virtualMap.get(v.id).langVariants;
        variants.forEach(node => {
            node.x = Math.round(v.x * 10) / 10;
            node.y = Math.round(v.y * 10) / 10;
            node.z = Math.round(v.z * 10) / 10;
        });
    });

    const graphData = {
        nodes: nodes,
        links: links
    };

    fs.writeFileSync(outputFile, JSON.stringify(graphData, null, 2));
    console.log(`Graph data generated with ${nodes.length} nodes and ${links.length} links.`);
}

generateGraph().catch(console.error);
