import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "FSD",
    description: "Frontend system design documentation",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Introduction to FSD', link: '/docs/intro' },
            { text: 'Application State', link: '/docs/application-state' },
            { text: 'Fundamentals', link: '/docs/fundamentals' },
            { text: 'Networking', link: '/docs/networking' },
            { text: 'Virtualization', link: '/docs/virtualization' },
            { text: 'Performance', link: '/docs/web-app-performance' },
            { text: 'Examples', link: '/markdown-examples' }
        ],

        sidebar: [
            {
                text: 'Examples',
                items: [
                    { text: 'Markdown Examples', link: '/markdown-examples' },
                    { text: 'Runtime API Examples', link: '/api-examples' }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ]
    }
})
