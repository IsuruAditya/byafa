export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MainTabParamList = {
  HomeTab: undefined
  ProductsTab: undefined
  CartTab: undefined
  OrdersTab: undefined
  ProfileTab: undefined
}

export type HomeStackParamList = {
  Home: undefined
  ProductDetail: { id: string }
}

export type ProductsStackParamList = {
  Products: undefined
  ProductDetail: { id: string }
}

export type CartStackParamList = {
  Cart: undefined
  Checkout: undefined
  CheckoutComplete: { paymentIntentId: string }
}

export type OrdersStackParamList = {
  OrderHistory: undefined
  OrderDetail: { id: string }
}

export type ProfileStackParamList = {
  Profile: undefined
  ChangePassword: undefined
}
