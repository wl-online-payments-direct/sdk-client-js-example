import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ['..']
		},
		port: 6500,
		open: true
	}
});
