import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load .env.test before any test module is imported
  const env = loadEnv(mode, process.cwd(), '')
  return {
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['./src/test/setup.ts'],
      // Use the test-specific tsconfig that relaxes rootDir
      typecheck: { tsconfig: './tsconfig.test.json' },
      env: {
        ...env,
        NODE_ENV: 'test',
        // Provide fallback values so env.ts doesn't exit during module load
        MONGO_URI: env['MONGO_URI'] ?? 'mongodb://localhost:27017/test-placeholder',
        JWT_SECRET: env['JWT_SECRET'] ?? 'test-jwt-secret-for-vitest-only',
        JWT_REFRESH_SECRET: env['JWT_REFRESH_SECRET'] ?? 'test-refresh-secret-for-vitest-only',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        include: ['src/services/**', 'src/api/controllers/**'],
        exclude: ['src/test/**', 'src/scripts/**'],
        thresholds: {
          lines: 70,
          functions: 70,
          branches: 60,
        },
      },
      // Run tests sequentially to avoid port/DB conflicts
      pool: 'forks',
      poolOptions: {
        forks: { singleFork: true },
      },
      testTimeout: 30000,
      // Only pick up source test files, not compiled dist/ output
      include: ['src/**/*.test.ts'],
      exclude: ['dist/**', 'node_modules/**'],
    },
  }
})
