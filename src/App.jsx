import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AquariumBackground from './components/AquariumBackground'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <AquariumBackground />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-secret-aquarium" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
