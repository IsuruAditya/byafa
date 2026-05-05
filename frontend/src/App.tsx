import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { AdminRoute } from './components/guards/AdminRoute'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './features/auth/RegisterPage'
import LoginPage from './features/auth/LoginPage'
import ProfilePage from './pages/ProfilePage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import AdminDashboard from './features/admin/AdminDashboard'
import AdminProductList from './features/admin/AdminProductList'
import AdminProductForm from './features/admin/AdminProductForm'
import AdminOrderList from './features/admin/AdminOrderList'
import AdminOrderDetail from './features/admin/AdminOrderDetail'
import ProductsPage from './features/products/ProductsPage'
import ProductDetailPage from './features/products/ProductDetailPage'
import CartPage from './features/cart/CartPage'
import CheckoutPage from './features/checkout/CheckoutPage'
import CheckoutCompletePage from './features/checkout/CheckoutCompletePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — full screen, no navbar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* All other pages — wrapped with Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Protected customer routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/complete" element={<CheckoutCompletePage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Admin-only routes — ProtectedRoute checks auth, AdminRoute checks role */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProductList />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
                <Route path="/admin/orders" element={<AdminOrderList />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
