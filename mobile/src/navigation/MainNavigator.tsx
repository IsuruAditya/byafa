import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { useAppSelector } from '../store/hooks'
import { useTheme } from '../hooks/useTheme'
import { fontSize, fontWeight } from '../constants/theme'

import type {
  MainTabParamList,
  HomeStackParamList,
  ProductsStackParamList,
  CartStackParamList,
  OrdersStackParamList,
  ProfileStackParamList,
} from './types'

import HomeScreen from '../screens/home/HomeScreen'
import ProductsScreen from '../screens/products/ProductsScreen'
import ProductDetailScreen from '../screens/products/ProductDetailScreen'
import CartScreen from '../screens/cart/CartScreen'
import CheckoutScreen from '../screens/checkout/CheckoutScreen'
import CheckoutCompleteScreen from '../screens/checkout/CheckoutCompleteScreen'
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen'
import OrderDetailScreen from '../screens/orders/OrderDetailScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()

// ── Stack navigators ──────────────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>()
function HomeStackNavigator() {
  const { colors } = useTheme()
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: fontWeight.semibold, fontSize: fontSize.md },
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
    </HomeStack.Navigator>
  )
}

const ProductsStack = createNativeStackNavigator<ProductsStackParamList>()
function ProductsStackNavigator() {
  const { colors } = useTheme()
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: fontWeight.semibold, fontSize: fontSize.md },
      }}
    >
      <ProductsStack.Screen name="Products" component={ProductsScreen} options={{ headerShown: false }} />
      <ProductsStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
    </ProductsStack.Navigator>
  )
}

const CartStack = createNativeStackNavigator<CartStackParamList>()
function CartStackNavigator() {
  const { colors } = useTheme()
  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: fontWeight.semibold, fontSize: fontSize.md },
      }}
    >
      <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <CartStack.Screen
        name="CheckoutComplete"
        component={CheckoutCompleteScreen}
        options={{ title: 'Order Confirmed', headerLeft: () => null }}
      />
    </CartStack.Navigator>
  )
}

const OrdersStack = createNativeStackNavigator<OrdersStackParamList>()
function OrdersStackNavigator() {
  const { colors } = useTheme()
  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: fontWeight.semibold, fontSize: fontSize.md },
      }}
    >
      <OrdersStack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
    </OrdersStack.Navigator>
  )
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>()
function ProfileStackNavigator() {
  const { colors } = useTheme()
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: fontWeight.semibold, fontSize: fontSize.md },
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </ProfileStack.Navigator>
  )
}

// ── Cart badge ────────────────────────────────────────────────────────────────

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const count = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  )
  return (
    <View>
      <Ionicons name="bag-outline" size={size} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  )
}

// ── Main tab navigator ────────────────────────────────────────────────────────

export function MainNavigator() {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.tabBarBorder,
          backgroundColor: colors.tabBar,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <CartTabIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
})
