import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { Route, Routes } from 'react-router'
import HomePage from './pages/pub/HomePage'
import Register from './pages/pub/Register';
import Login from './pages/pub/Login';
import DetailPage from './pages/pub/DetailPage';
import TryonPage from './components/Tryon';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />

        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />

        <Route path='/products/:id' element={<DetailPage />} />
      </Routes>
    </>
  )
}

export default App
