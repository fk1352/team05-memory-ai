import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/shell/AppShell'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'

// Each screen owner swaps their PlaceholderPage for the real screen.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/map" element={<PlaceholderPage titleKey="pages.map" />} />
        <Route path="/search" element={<PlaceholderPage titleKey="pages.search" />} />
        <Route path="/input" element={<PlaceholderPage titleKey="pages.input" />} />
        <Route path="/privacy" element={<PlaceholderPage titleKey="pages.privacy" />} />
      </Route>
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  )
}

export default App
