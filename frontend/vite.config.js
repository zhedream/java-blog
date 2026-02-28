import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {fileURLToPath, URL} from 'node:url'
import {codeInspectorPlugin} from 'code-inspector-plugin'

export default defineConfig({
    plugins: [
        vue(),
        codeInspectorPlugin({bundler: 'vite', editor: 'idea'}),
    ],
    resolve: {
        alias: {'@': fileURLToPath(new URL('./src', import.meta.url))}
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    }
})
