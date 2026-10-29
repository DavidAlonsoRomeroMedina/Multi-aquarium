import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import GiftPage from './pages/GiftPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GiftPage />} />
        <Route path="/para-david" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
