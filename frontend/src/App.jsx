import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageLoader from './components/PageLoader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Solutions from './components/Solutions'
import Process from './components/Process'
import WorkspaceSection from './components/WorkspaceSection'
import ProcessPage from './components/ProcessPage'


import Footer from './components/Footer'
import Login from './components/Login'
import SignUp from './components/SignUp'
import PublicVideoShowcase from './components/PublicVideoShowcase'
import AllServices from './components/UserServices/AllServices'
import FAQ from './components/FAQ'
import MyServices from './components/UserServices/MyServices'
import UserDashboard from './components/UserServices/UserDashboard'
import ServiceManager from './components/UserServices/ServiceManager'
import ServiceDetails from './components/UserServices/ServiceDetails'
import AdminLogin from './components/AdminServices/AdminLogin'
import AdminDashboard from './components/AdminServices/AdminDashboard'
import AdminAllUser from './components/AdminServices/AdminAllUser'
import AdminAllVideos from './components/AdminServices/AdminAllVideos'
import AddAutomationByAdmin from './components/AddAutomationByAdmin/AddAutomationByAdmin'
import ManageAutomations from './components/AddAutomationByAdmin/ManageAutomations'
import InstagramManager from './components/AdminServices/InstagramManager'
import AiImageGenerator from './components/SocialMedia/AiImageGenerator'
import ContentCalendar from './components/SocialMedia/ContentCalendar'
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard'
import QueueManager from './components/SocialMedia/QueueManager'
import LeadsDashboard from './components/LeadGeneration/LeadsDashboard'
import ScraperPanel from './components/LeadGeneration/ScraperPanel'
import CampaignsManager from './components/LeadGeneration/CampaignsManager'
import CampaignDetail from './components/LeadGeneration/CampaignDetail'
import Integrations from './components/Integrations'
import ResetPassword from './components/Auth/ResetPassword'

import SmoothScroll from './components/SmoothScroll'

import { Toaster } from 'react-hot-toast'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showSignUp, setShowSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Global Page Transitions Loader
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200) // Slightly longer on initial load/navigation for consistent feel

    return () => clearTimeout(timer)
  }, [location.pathname]) // Triggers on every page change

  // Handle Hash Scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 1200); // Wait for PageLoader to finish
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash])

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  // Session persistence
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('role')
    }
  }, [user])

  const handleLogout = () => {
    setUser(null)
    localStorage.clear()
    navigate('/')
  }

  return (
    <SmoothScroll>
      <AnimatePresence mode="wait">
        {isLoading && <PageLoader key="loader" />}
      </AnimatePresence>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <Navbar
          user={user}
          onSignUp={() => setShowSignUp(true)}
          onLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          isAdmin={user?.role === 'admin'}
        />

        {showSignUp && (
          <SignUp
            onToggle={() => setShowSignUp(false)}
            onSignUpSuccess={(userData) => setUser(userData)}
            switchToLogin={() => {
              setShowSignUp(false)
              setShowLogin(true)
            }}
          />
        )}

        {showLogin && (
          <Login
            onToggle={() => setShowLogin(false)}
            onLoginSuccess={(userData) => setUser(userData)}
            switchToSignUp={() => {
              setShowLogin(false)
              setShowSignUp(true)
            }}
          />
        )}

        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={
            <>
              <Hero />
              <Solutions />
              <Integrations />



              <Process />
              <WorkspaceSection />
              <PublicVideoShowcase />
              <AllServices featuredOnly={true} isHomePage={true} />
              <FAQ />
            </>
          } />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={user ? <UserDashboard user={user} /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/all-services" element={<AllServices />} />
          <Route path="/service/:id" element={<ServiceDetails />} />
          <Route path="/my-services" element={user ? <MyServices /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/service-manager/:id" element={user ? <ServiceManager /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/ai-image-generator" element={user ? <AiImageGenerator service={{ name: 'AI Image Generator' }} /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/social/calendar" element={user ? <ContentCalendar /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/analytics" element={user ? <AnalyticsDashboard /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/social/queue" element={user ? <QueueManager /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/leads" element={user ? <LeadsDashboard /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/scraper" element={user ? <ScraperPanel /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/campaigns" element={user ? <CampaignsManager /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/campaigns/:id" element={user ? <CampaignDetail /> : <Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login onLoginSuccess={setUser} onToggle={() => navigate('/')} switchToSignUp={() => navigate('/register')} />} />
          <Route path="/register" element={<SignUp onSignUpSuccess={setUser} onToggle={() => navigate('/')} switchToLogin={() => navigate('/login')} />} />
          <Route path="/process" element={<ProcessPage />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            user?.role === 'admin' ? (
              <div className="pt-20">
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/automation" element={<AddAutomationByAdmin />} />
                  <Route path="/manage-automation" element={<ManageAutomations />} />
                  <Route path="/users" element={<AdminAllUser />} />
                  <Route path="/videos" element={<AdminAllVideos />} />
                </Routes>
              </div>
            ) : <AdminLogin onLoginSuccess={setUser} onToggle={() => navigate('/')} />
          } />
        </Routes>

        <Footer />
      </div>
    </SmoothScroll>
  )
}



export default App;
