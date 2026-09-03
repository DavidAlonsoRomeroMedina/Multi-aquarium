import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ActivityGate from './components/ActivityGate'
import AquariumBackground from './components/AquariumBackground'
import AdminPage from './pages/AdminPage'
import Enamora2Page from './pages/Enamora2Page'
import HomePage from './pages/HomePage'
import HubPage from './pages/HubPage'

export default function App() {
  return (
    <BrowserRouter>
      <AquariumBackground />
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route
          path="/admirador-secreto"
          element={
            <ActivityGate activityId="admirador-secreto">
              <HomePage />
            </ActivityGate>
          }
        />
        <Route
          path="/enamora2"
          element={
            <ActivityGate activityId="enamora2">
              <Enamora2Page />
            </ActivityGate>
          }
        />
        <Route path="/admin-secret-aquarium" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
