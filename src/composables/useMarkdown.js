import { ref, computed } from 'vue';
import fm from 'front-matter';

// State to cache posts to avoid re-parsing on every call if not needed
// In a simple app, we can just load them once.
const posts = ref([]);
const loaded = ref(false);

export function useMarkdown() {

    const loadPosts = () => {
        if (loaded.value) return;

        // Eagerly load all markdown files from /src/content
        // We use query: '?raw' to get the string content
        const modules = import.meta.glob('@/content/**/*.md', { query: '?raw', import: 'default', eager: true });

        const allPosts = [];

        for (const path in modules) {
            const rawContent = modules[path];
            const content = fm(rawContent);
            const frontmatter = content.attributes;

            // Determine type based on path (blog vs portfolio vs friend)
            const isBlog = path.includes('/blog/');
            const isPortfolio = path.includes('/portfolio/');
            const isFriend = path.includes('/friend/');

            // Generate slug from filename
            const filename = path.split('/').pop().replace('.md', '');

            // Derive Category from Folder Name
            // Logic: path looks like .../content/blog/[category]/post.md
            // We search for 'blog' or 'portfolio' in the path, and check if there's a folder after it.
            let computedCategory = frontmatter.category;
            const pathParts = path.split('/');
            const typeIndex = pathParts.findIndex(p => p === (isBlog ? 'blog' : (isPortfolio ? 'portfolio' : 'friend')));

            // If type found and there is a folder between type and filename
            // pathParts length must be > typeIndex + 2 (type + folder + filename)
            if (typeIndex !== -1 && pathParts.length > typeIndex + 2) {
                // The folder name is immediately after the type
                const folderName = pathParts[typeIndex + 1];
                // Simple capitalization
                computedCategory = folderName.charAt(0).toUpperCase() + folderName.slice(1);
            }

            allPosts.push({
                ...frontmatter,
                category: computedCategory, // Override or keep original
                slug: filename,
                body: content.body,
                type: isBlog ? 'blog' : (isPortfolio ? 'portfolio' : (isFriend ? 'friend' : 'other')),
                path: path
            });
        }

        // Sort by date desc (assuming date is in frontmatter)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        posts.value = allPosts;
        loaded.value = true;
    };

    // Initialize loading immediately
    loadPosts();

    const getPosts = (type) => {
        return computed(() => {
            if (!type) return posts.value;
            return posts.value.filter(p => p.type === type);
        });
    };

    const getCategories = (type) => {
        return computed(() => {
            const list = type ? posts.value.filter(p => p.type === type) : posts.value;
            const allCats = list.map(p => p.category).filter(Boolean);
            // Deduplicate
            return ['All', ...new Set(allCats)];
        });
    };

    // Helper to find single post
    const getPostBySlug = (slug, type) => {
        return computed(() => {
            return posts.value.find(p => p.slug === slug && (type ? p.type === type : true));
        });
    };

    // Helper to get previous and next posts
    const getAdjacentPosts = (slug, type) => {
        return computed(() => {
            const list = type ? posts.value.filter(p => p.type === type) : posts.value;
            const index = list.findIndex(p => p.slug === slug);

            if (index === -1) return { prev: null, next: null };

            // Since list is sorted descending by date:
            // Next item in array = Older post (Previous in time) -> But usually "Next" UI means "Newer"? 
            // Actually usually "Next" means the next one to read.
            // Let's stick to Array order:
            // Prev Index (i-1) = Newer Post
            // Next Index (i+1) = Older Post
            // User request: Previous (<) and Next (>)
            // Usually < is Newer and > is Older in blog context, or vice versa?
            // Let's assume standard pagination: < Prev (Newer) | Next > (Older)

            const prev = index > 0 ? list[index - 1] : null;
            const next = index < list.length - 1 ? list[index + 1] : null;

            return { prev, next };
        });
    };

    // Helper to get Profile data (single file)
    const getProfile = () => {
        return computed(() => {
            const modules = import.meta.glob('@/content/profile/profile.md', { query: '?raw', import: 'default', eager: true });
            for (const path in modules) {
                const rawContent = modules[path];
                const content = fm(rawContent);
                return {
                    ...content.attributes,
                    body: content.body
                };
            }
            return null;
        });
    };

    return {
        posts,
        getPosts,
        getCategories,
        getPostBySlug,
        getAdjacentPosts,
        getProfile
    };
}
