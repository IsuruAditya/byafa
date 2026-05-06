import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { ProtectedRoute } from './components/guards/ProtectedRoute'
import { AdminRoute } from './components/guards/AdminRoute'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './features/auth/RegisterPage'
import LoginPage from './features/auth/LoginPage'
import AdminLoginPage from './features/admin/AdminLoginPage'
import ProfilePage from './pages/ProfilePage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'
import AdminDashboard from './features/admin/AdminDashboard'
import AdminProductList from './features/admin/AdminProductList'
import AdminProductForm from './features/admin/AdminProductForm'
import AdminInventory from './features/admin/AdminInventory'
import AdminOrderList from './features/admin/AdminOrderList'
import AdminOrderDetail from './features/admin/AdminOrderDetail'
import AdminCustomers from './features/admin/AdminCustomers'
import AdminAnalytics from './features/admin/AdminAnalytics'
import ProductsPage from './features/products/ProductsPage'
import ProductDetailPage from './features/products/ProductDetailPage'
import CartPage from './features/cart/CartPage'
import CheckoutPage from './features/checkout/CheckoutPage'
import CheckoutCompletePage from './features/checkout/CheckoutCompletePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Storefront auth ──────────────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Admin portal — completely separate from storefront ───── */}
        {/* Own login page, own layout, no storefront navbar/footer    */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"                       element={<AdminDashboard />} />
              <Route path="/admin/products"              element={<AdminProductList />} />
              <Route path="/admin/products/new"          element={<AdminProductForm />} />
              <Route path="/admin/products/:id/edit"     element={<AdminProductForm />} />
              <Route path="/admin/inventory"             element={<AdminInventory />} />
              <Route path="/admin/orders"                element={<AdminOrderList />} />
              <Route path="/admin/orders/:id"            element={<AdminOrderDetail />} />
              <Route path="/admin/customers"             element={<AdminCustomers />} />
              <Route path="/admin/analytics"             element={<AdminAnalytics />} />
            </Route>
          </Route>
        </Route>

        {/* ── Storefront ───────────────────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/"              element={<HomePage />} />
          <Route path="/products"      element={<ProductsPage />} />
          <Route path="/products/:id"  element={<ProductDetailPage />} />
          <Route path="/cart"          element={<CartPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile"            element={<ProfilePage />} />
            <Route path="/checkout"           element={<CheckoutPage />} />
            <Route path="/checkout/complete"  element={<CheckoutCompletePage />} />
            <Route path="/orders"             element={<OrderHistoryPage />} />
            <Route path="/orders/:id"         element={<OrderDetailPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}
