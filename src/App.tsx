import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ClientTicket from "./pages/ClientTicket";
import OperatorScanner from "./pages/OperatorScanner";
import LiveDashboard from "./pages/LiveDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/client" element={<ClientTicket />} />
            <Route path="/operator" element={<OperatorScanner />} />
            <Route path="/dashboard" element={<LiveDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
