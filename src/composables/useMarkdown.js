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

            // Assign default random image if not present
            if (!frontmatter.image && !frontmatter.cover) {
                // Total 25 default images available
                const randomId = Math.ceil(Math.random() * 25);
                frontmatter.image = `/assets/img-dark/default/${randomId}.jpg`;
            } else if (frontmatter.cover && !frontmatter.image) {
                // Support legacy 'cover' field
                frontmatter.image = frontmatter.cover;
            }

            // Determine type based on path (blog vs portfolio vs friend)
            const isBlog = path.includes('/blog/');
            const isPortfolio = path.includes('/portfolio/');
            const isFriend = path.includes('/friend/');
            const isJournal = path.includes('/journal/');

            // Determine language
            // Assume default 'zh' unless '/en/' is explicitly found
            // Or strictly check for /zh/ vs /en/
            let lang = 'zh';
            if (path.includes('/en/')) lang = 'en';
            else if (path.includes('/zh/')) lang = 'zh';

            // Generate slug from filename
            const filename = path.split('/').pop().replace('.md', '');

            // Enforce strict YYYY-MM-DD filename for Journal entries
            if (isJournal) {
                const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                if (!datePattern.test(filename)) {
                    continue;
                }
            }

            // Derive Category from Folder Name
            // Logic: path looks like .../content/blog/zh/[category]/post.md
            // OR .../content/blog/[category]/post.md (legacy/fallback)

            let computedCategory = frontmatter.category;
            const pathParts = path.split('/');

            // Find where 'blog' or 'portfolio' is
            const typeKey = isBlog ? 'blog' : (isPortfolio ? 'portfolio' : (isFriend ? 'friend' : (isJournal ? 'journal' : null)));
            const typeIndex = typeKey ? pathParts.findIndex(p => p === typeKey) : -1;

            if (typeIndex !== -1) {
                // Check what comes after type
                // It could be 'zh', 'en', or a category directly
                let categoryIndex = typeIndex + 1;

                // If the next part is a language code, skip it
                if (pathParts[categoryIndex] === 'zh' || pathParts[categoryIndex] === 'en') {
                    categoryIndex++;
                }

                // Now, if there is still a folder before the filename
                // pathParts length must be > categoryIndex + 1 (filename is at the end)
                if (pathParts.length > categoryIndex + 1) {
                    const folderName = pathParts[categoryIndex];
                    // Simple capitalization
                    computedCategory = folderName.charAt(0).toUpperCase() + folderName.slice(1);
                }
            }

            allPosts.push({
                ...frontmatter,
                category: computedCategory, // Override or keep original
                slug: filename,
                body: content.body,
                type: isBlog ? 'blog' : (isPortfolio ? 'portfolio' : (isFriend ? 'friend' : (isJournal ? 'journal' : 'other'))),
                lang: lang,
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

    // Modified to optionally filter by language, defaults to ignoring language for backward compat if not provided
    // BUT for the new requirement, we might usually want all languages and filter in component, 
    // or filter here. The user didn't specify strict API changes, but component logic needs it.
    // Let's keep getPosts returning everything, or maybe standard "get all for type" is fine.
    // The previous implementation of getPosts(type) returned all posts of that type.
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
    // Modified signature to accept optional lang, but primarily we filter in the component or here.
    // PostBySlug needs to return a computed that might need to be language aware?
    // User requirement: "getPostBySlug(slug, 'blog')" in component.
    // Component will use: allPosts.value.find(p => p.slug === route.params.id && p.lang === currentLang.value);
    // So the component will likely implement its own find logic using the full list if we don't update this helper.
    // However, existing usage in BlogDetail is: const post = getPostBySlug(slug.value, 'blog')
    // We should probably NOT change this verify signature too much if we want to support the custom logic in component,
    // OR we change this to return ALL posts with that slug (different languages)
    // OR we just assume the component will do the finding since the requirement says:
    // "In BlogDetail... const post = computed(() => return allPosts.value.find(...))"
    // So I will expose `posts` (which is already exposed) and let the component do the specific filtering.
    // But I should leave getPostBySlug as is (it might return the first match, probably 'zh' since it's default or sorted?).
    // Actually, if there are duplicate slugs now (zh and en), getPostBySlug will return the first one found.
    // That might be ambiguous.
    // Let's update getPostBySlug to optionally accept lang, or return a list?
    // The existing code expects a single ref.
    // Let's minimally touch this helper to avoid breaking other things, but maybe make it smart enough to prefer 'zh' if no lang specified?
    // It's safer to let the Component implement the specific logic as requested in the prompts.

    // I will keep it returning the first match for now, but usually it matches slug + type.
    const getPostBySlug = (slug, type) => {
        return computed(() => {
            // Default behavior: find first match. 
            // If multiple exist (en/zh), this returns one of them indiscriminately unless we sort or filter.
            // Since we sorted by date, it might vary. 
            // Ideally we shouldn't rely on this helper for the new i18n view unless we pass lang.
            return posts.value.find(p => p.slug === slug && (type ? p.type === type : true));
        });
    };

    // Helper to get previous and next posts
    // Needs to be aware of language to not link zh -> en
    // I'll add an optional `lang` parameter, default 'zh'
    const getAdjacentPosts = (slug, type, lang = 'en') => {
        return computed(() => {
            // Filter by type AND lang
            const list = posts.value.filter(p =>
                (type ? p.type === type : true) &&
                (p.lang === lang)
            );

            const index = list.findIndex(p => p.slug === slug);

            if (index === -1) return { prev: null, next: null };

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
