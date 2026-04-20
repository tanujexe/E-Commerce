/**
 * App.jsx — Route definitions
 */

import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import Navbar        from './components/Navbar.jsx';
import Footer        from './components/Footer.jsx';
import Loader        from './components/Loader.jsx';
import PrivateRoute  from './components/PrivateRoute.jsx';
import AdminRoute    from './components/AdminRoute.jsx';
import ScrollToTop   from './components/ScrollToTop.jsx';

// Lazy-loaded pages
const HomePage          = lazy(() => import('./pages/HomePage.jsx'));
const ProductsPage      = lazy(() => import('./pages/ProductsPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'));
const CartPage          = lazy(() => import('./pages/CartPage.jsx'));
const LoginPage         = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage.jsx'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage.jsx'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderHistoryPage  = lazy(() => import('./pages/OrderHistoryPage.jsx'));
const OrderDetailPage   = lazy(() => import('./pages/OrderDetailPage.jsx'));
const NotFoundPage      = lazy(() => import('./pages/NotFoundPage.jsx'));

// Admin pages
const AdminLayout       = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts     = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminOrders       = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers.jsx'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<Loader fullScreen />}>
            <Routes>
              {/* Public */}
              <Route path="/"                   element={<HomePage />} />
              <Route path="/products"            element={<ProductsPage />} />
              <Route path="/products/:id"        element={<ProductDetailPage />} />
              <Route path="/cart"                element={<CartPage />} />
              <Route path="/login"               element={<LoginPage />} />
              <Route path="/register"            element={<RegisterPage />} />

              {/* Protected – logged-in users */}
              <Route element={<PrivateRoute />}>
                <Route path="/profile"           element={<ProfilePage />} />
                <Route path="/checkout"          element={<CheckoutPage />} />
                <Route path="/orders"            element={<OrderHistoryPage />} />
                <Route path="/orders/:id"        element={<OrderDetailPage />} />
              </Route>

              {/* Admin only — wrapped in sidebar layout */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin"             element={<AdminDashboard />} />
                  <Route path="/admin/products"    element={<AdminProducts />} />
                  <Route path="/admin/orders"      element={<AdminOrders />} />
                  <Route path="/admin/users"       element={<AdminUsers />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*"                    element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
