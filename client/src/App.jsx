import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { Route, Routes } from 'react-router'
import HomePage from './pages/pub/HomePage'
import Register from './pages/pub/Register';
import Login from './pages/pub/Login';
import DetailPage from './pages/pub/DetailPage';
import Cart from './pages/pub/Cart';
import CheckoutPage from './pages/pub/CheckoutPage';
import OrderPage from './pages/pub/OrderPage';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />

        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />

        <Route path='/products/:id' element={<DetailPage />} />
        <Route path='/carts' element={<Cart />} />
        <Route path='checkout' element={<CheckoutPage />} />
        <Route path='orders' element={<OrderPage />} />
      </Routes>
    </>
  )
}

export default App
