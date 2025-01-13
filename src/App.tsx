import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import Index from "@/pages/Index"
import Login from "@/pages/Login"
import SignUp from "@/pages/SignUp"
import Dashboard from "@/pages/Dashboard"
import Job from "@/pages/Job"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs/:id" element={<Job />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </BrowserRouter>
  )
}

export default App