const transformImportMeta = ({ types }) => ({
  visitor: {
    MetaProperty(path) {
      if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
        path.replaceWith(
          types.objectExpression([
            types.objectProperty(
              types.identifier('env'),
              types.objectExpression([
                types.objectProperty(
                  types.identifier('DEV'),
                  types.booleanLiteral(true),
                ),
              ]),
            ),
          ]),
        )
      }
    },
  },
})

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: [transformImportMeta],
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },
  testMatch: ['<rootDir>/src/**/*.(test|spec).[jt]s?(x)'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/pages/**/*.{ts,tsx}',
    'src/routes/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/routeTree.gen.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
  ],
};
