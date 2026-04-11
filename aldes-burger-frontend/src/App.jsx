import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Kitchen from './pages/Kitchen'
import Transactions from './pages/Transactions'
import Cart from './pages/Cart'

function App() {
  const [cartCount, setCartCount] = useState(0)
  const [activePromo] = useState(0)

  const burgerMenu = [
    { id: 1, name: 'Beef Burger - Double Patty', desc: 'Daging Sapi Pilihan, Keju, Saus Spesial', price: 'Rp 55.000', isCustom: false },
    { id: 2, name: 'Spicy Crispy Chicken Burger', desc: 'Ayam Krispi Pedas, Selada, Mayo', price: 'Rp 45.000', isCustom: false },
    { id: 3, name: 'Make Your Own Burger', desc: '*Blank, menyesuaikan. Rakit burger sesuai seleramu!', price: '', isCustom: true },
  ]

  const sideDishes = [
    { id: 4, name: 'French Fries', price: 'Rp 25.000' },
    { id: 5, name: 'Nugget', price: 'Rp 30.000' },
    { id: 6, name: 'Onion Ring', price: 'Rp 28.000' },
  ]

  const drinks = [
    { id: 7, name: 'Soft Drink', price: 'Rp 15.000' },
    { id: 8, name: 'Tea', price: 'Rp 12.000' },
    { id: 9, name: 'Water', price: 'Rp 10.000' },
  ]

  const addToCart = () => setCartCount((prev) => prev + 1)

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
