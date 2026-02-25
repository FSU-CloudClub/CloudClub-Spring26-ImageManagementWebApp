import { Navigate } from "react-router-dom";
import { useAuth } from "./components/useAuth";

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
  
    if (loading) return <p>Loading Security Session...</p>;
  
    // If not logged in, kick them to the login page
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  
    return children; // If logged in, show the Gallery
  };