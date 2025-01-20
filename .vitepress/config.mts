import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: "/fsd/",
    cleanUrls: true,
    description: "Frontend system design documentation",
    markdown: {
        image: {
            lazyLoading: true,
        },
    },
    srcDir: "src",
    title: "FSD",
    themeConfig: {
        aside: false,

        logo: {
            alt: "Frontend System Design's logo",
            src: "/logo.webp",
        },

        outline: false,

        nav: [
            //{ text: 'Home', link: '/' },
            { text: 'Introduction to FSD', link: '/docs/intro' },
            { text: 'Fundamentals', link: '/docs/fundamentals' },
            { text: 'State', link: '/docs/state' },
            { text: 'APIs', link: '/docs/apis' },
            { text: 'UI Interactions', link: '/docs/ui-interactions' },
            { text: 'Asset Management', link: '/docs/assets' },
            { text: 'Performance', link: '/docs/performance' },
            { text: 'Resources', link: '/docs/resources' },
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/Johnsoct/fsd' },
        ]
    }
})
