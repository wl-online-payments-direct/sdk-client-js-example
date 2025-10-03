import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, '../../shared')
        }
    },
    server: {
        open: true,
        port: 6503
    }
});
