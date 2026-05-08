import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, useColorScheme } from 'react-native'
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { Provider } from 'react-redux'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SecureStore from 'expo-secure-store'
import { store } from './src/store'
import { setCredentials, updateAccessToken, logout } from './src/store/slices/authSlice'
import { RootNavigator } from './src/navigation/RootNavigator'
import { ToastContainer } from './src/components/ui/Toast'
import { getMeApi } from './src/api/authApi'
import axiosInstance from './src/api/axiosInstance'
import { lightColors, darkColors } from './src/constants/theme'

// ── Custom nav themes ─────────────────────────────────────────────────────────

const LightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background:  lightColors.background,
    card:        lightColors.surface,
    text:        lightColors.text,
    border:      lightColors.border,
    primary:     lightColors.primary,
    notification: lightColors.primary,
  },
}

const DarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background:  darkColors.background,
    card:        darkColors.surface,
    text:        darkColors.text,
    border:      darkColors.border,
    primary:     darkColors.primary,
    notification: darkColors.primary,
  },
}

// ── App initializer ───────────────────────────────────────────────────────────

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const scheme = useColorScheme()
  const colors = scheme === 'dark' ? darkColors : lightColors

  useEffect(() => {
    async function init() {
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken')
        if (!refreshToken) return

        // Exchange stored refresh token for a new access token
        const { data } = await axiosInstance.post<{
          success: boolean
          data: { accessToken: string }
        }>('/auth/refresh', { refreshToken })

        if (!data.success || !data.data?.accessToken) return

        const accessToken = data.data.accessToken
        store.dispatch(updateAccessToken(accessToken))

        const meRes = await getMeApi()
        if (meRes.success && meRes.data) {
          store.dispatch(setCredentials({ user: meRes.data.user, accessToken }))
        } else {
          store.dispatch(logout())
          await SecureStore.deleteItemAsync('refreshToken')
        }
      } catch {
        await SecureStore.deleteItemAsync('refreshToken')
        store.dispatch(logout())
      } finally {
        setIsReady(true)
      }
    }

    void init()
  }, [])

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return <>{children}</>
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const scheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer theme={scheme === 'dark' ? DarkNavTheme : LightNavTheme}>
            <AppInitializer>
              <RootNavigator />
              <ToastContainer />
            </AppInitializer>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}
