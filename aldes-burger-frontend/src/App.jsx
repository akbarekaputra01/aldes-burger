import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import AdminDashboard from './pages/AdminDashboard'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import Home from './pages/Home'
import Kitchen from './pages/Kitchen'
import PaymentStatus from './pages/PaymentStatus'
import Profile from './pages/Profile'
import Transactions from './pages/Transactions'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
