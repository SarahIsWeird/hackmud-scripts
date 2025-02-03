import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '/lib': '/src/lib',
            '/scripts': '/src/scripts',
        },
    },
    test: {
        include: ['test/**/*.ts'],
    },
});
