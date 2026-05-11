import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import NoteDetail from "./pages/NoteDetail"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/note/:id" element={<NoteDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App