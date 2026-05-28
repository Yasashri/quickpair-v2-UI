import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyProfile from "./pages/MyProfile";
import Messages from "./pages/Messages";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfileDetail from "./pages/AdminProfileDetail";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { NewMessageProvider } from "./context/NewMessageContext";
import Footer from "./components/Footer";

function App() {
  return (
    <NewMessageProvider>
      <div className='app-shell'>
        <Header />
        <main className='page-container'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/profiles' element={<Profiles />} />
            <Route path='/profiles/:id' element={<ProfileDetail />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route
              path='/me'
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path='/messages'
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route path='/admin/login' element={<AdminLogin />} />
            <Route
              path='/admin/dashboard'
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path='/admin/profiles/:id'
              element={
                <AdminProtectedRoute>
                  <AdminProfileDetail />
                </AdminProtectedRoute>
              }
            />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </NewMessageProvider>
  );
}

export default App;
