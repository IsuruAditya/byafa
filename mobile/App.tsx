import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
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
import { colors } from './src/constants/theme'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

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

        if (!data.success || !data.data.accessToken) return

        const accessToken = data.data.accessToken

        // Temporarily inject the token into axios headers for the /me call
        // (the interceptor reads from Redux, so we set it there first)
        store.dispatch(updateAccessToken(accessToken))

        // Fetch the full user profile
        const meRes = await getMeApi()
        if (meRes.success && meRes.data) {
          store.dispatch(
            setCredentials({
              user: meRes.data.user,
              accessToken,
            })
          )
        } else {
          // /me failed — clear the partial state
          store.dispatch(logout())
          await SecureStore.deleteItemAsync('refreshToken')
        }
      } catch {
        // Refresh failed — clear stored token, user stays logged out
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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
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
