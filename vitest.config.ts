import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/stores/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true
  }
})
