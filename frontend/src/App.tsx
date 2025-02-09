import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GlobalProvider } from "./context/GlobalContext";
import ExpenseList from "./pages/ExpenseList";
import ExpenseCategory from "./pages/ExpenseCategoryList";
import Currencies from "./pages/CurrenciesList";
import ExpenseReport from "./pages/ExpenseReport";
import SystemSetting from "./pages/SystemSettings";
import Navbar from "./components/Navbar";
import { Flowbite } from "flowbite-react";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './lang/i18n';

interface AuthCheckProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // AuthCheck component that checks authentication status
  function AuthCheck({ setIsAuthenticated } : AuthCheckProps) {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("authToken");
      const expirationTime = localStorage.getItem("tokenExpiration");
      window.addEventListener("beforeunload", () => {
        localStorage.setItem("lastVisitedPath", window.location.pathname);
      });
      if (!token || !expirationTime) {
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          localStorage.setItem("lastVisitedPath", window.location.pathname);
          navigate("/login");
        }
        setIsAuthenticated(false);
        return;
      }

      if (new Date().getTime() > parseInt(expirationTime)) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiration");
        setIsAuthenticated(false);
        const notify = () => toast.warning("Toke is expire!");
        notify();
        localStorage.setItem("lastVisitedPath", window.location.pathname);
        navigate("/login");
      } else {
        setIsAuthenticated(true);
      }
    }, [navigate, setIsAuthenticated]);

    return null;
  }
  return (
    <Router>
      <GlobalProvider>
        <Flowbite>
          <ToastContainer />
          <AuthCheck setIsAuthenticated={setIsAuthenticated} />
          {isAuthenticated && <Navbar />}
          <div className="p-5 md:p-6">
            <Routes>
              <Route
                path="/"
                element={isAuthenticated ? <ExpenseList /> : <Login />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/category_expense" element={<ExpenseCategory />} />
              <Route path="/currencies" element={<Currencies />} />
              <Route path="/expense_report" element={<ExpenseReport />} />
              <Route path="/system_settings" element={<SystemSetting />} />
            </Routes>
          </div>
        </Flowbite>
      </GlobalProvider>
    </Router>
  );
}

export default App;
