module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts', '<rootDir>/tests/unit/**/*.test.tsx'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'CommonJS', moduleResolution: 'Node', jsx: 'react-jsx' } }] },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx', '!src/vite-env.d.ts'],
  coverageReporters: ['text', 'json-summary', 'lcov'],
  coverageThreshold: { global: { lines: 95, branches: 95, functions: 95, statements: 95 } },
};
