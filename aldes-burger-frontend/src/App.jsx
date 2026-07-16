import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import AddressBook from './pages/AddressBook'
import AdminDashboard from './pages/AdminDashboard'
import AdminInventory from './pages/AdminInventory'
import AdminMenuManagement from './pages/AdminMenuManagement'
import AdminOrders from './pages/AdminOrders'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import LandingPage from './pages/LandingPage'
import Menu from './pages/Menu'
import Kitchen from './pages/Kitchen'
import NotFound from './pages/NotFound'
import PaymentStatus from './pages/PaymentStatus'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'
import TransactionDetail from './pages/TransactionDetail'
import Transactions from './pages/Transactions'

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
        <Routes>
          {/* 🔴 PUBLIC ROUTES: Bisa diakses siapa saja (tanpa Layout) */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<SignUp />} />

          {/* 🔴 ADMIN ROUTES: Wajib Login (Dilindungi) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="menu" element={<AdminMenuManagement />} />
              <Route path="inventory" element={<AdminInventory />} />
            </Route>
          </Route>

          {/* 🔴 MAIN LAYOUT ROUTES (Mendapatkan Navbar & Footer) */}
          <Route element={<Layout />}>
            
            {/* Bebas diakses tanpa perlu login (Bisa lihat menu & merakit burger) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/menu" element={<Menu />} />
            

            {/* Wajib Login (Dilindungi oleh ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:id" element={<TransactionDetail />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
<<<<<<< HEAD
              
=======
>>>>>>> e1c233f3311a173f57da73287f6c9e716cac6d85
              <Route path="/address-book" element={<AddressBook />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment-status" element={<PaymentStatus />} />
            </Route>
            
          </Route>

          {/* 🔴 404 NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  )
}

export default App
