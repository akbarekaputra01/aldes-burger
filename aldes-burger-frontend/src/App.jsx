import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Kitchen from './pages/Kitchen'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/kitchen" element={<Kitchen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
