import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import AddressBook from './pages/AddressBook'
import AdminDashboard from './pages/AdminDashboard'
import AdminInventory from './pages/AdminInventory'
import AdminMenuManagement from './pages/AdminMenuManagement'
import AdminOrders from './pages/AdminOrders'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Kitchen from './pages/Kitchen'
import NotFound from './pages/NotFound'
import PaymentStatus from './pages/PaymentStatus'
import Profile from './pages/Profile'
import SignUp from './pages/SignUp'
import TransactionDetail from './pages/TransactionDetail'
import Transactions from './pages/Transactions'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="menus" element={<AdminMenuManagement />} />
            <Route path="inventory" element={<AdminInventory />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/address-book" element={<AddressBook />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
