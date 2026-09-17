import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Pages/Authentication/Login'
import RouteList from './Pages/RouteList'
import AuthPage from './Pages/Authentication/AuthPage'



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/*" element={<RouteList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
