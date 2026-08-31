import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: 'ut',
                    include: ['server/**/*.test.js'],
                    environment: 'node',
                },
            },
            {
                extends: true,
                test: {
                    name: 'ct',
                    include: ['src/**/*.ct.js'],
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                    },
                },
            },
        ],
    },
});