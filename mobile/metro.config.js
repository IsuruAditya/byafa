const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// On web, replace @stripe/stripe-react-native with a no-op stub
// because the real package is native-only and crashes the web bundler.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@stripe/stripe-react-native') {
    return {
      filePath: require.resolve('./src/mocks/stripe-react-native.web.ts'),
      type: 'sourceFile',
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
