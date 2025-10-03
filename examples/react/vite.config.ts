import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, '../../shared')
        }
    },
    server: {
        open: true,
        port: 6502
    }
});
