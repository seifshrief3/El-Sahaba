import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // =========================
  // Get Current User
  // =========================

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        setRole(currentUser.app_metadata?.role ?? null);
      }

      setLoading(false);
    };

    getCurrentUser();

    // Listen To Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        setRole(currentUser.app_metadata?.role ?? null);
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // Login
  // =========================

  const handleLogin = async (e, email, password) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const loggedInUser = data.user;

      setUser(loggedInUser);

      // 💡 التعديل هنا: قراءة الصلاحية من user_metadata للعملاء أو app_metadata للموظفين
      const userRole =
        loggedInUser.user_metadata?.role ||
        loggedInUser.app_metadata?.role ||
        null;

      setRole(userRole);

      return {
        success: true,
        user: loggedInUser,
        role: userRole,
      };
    } catch (error) {
      alert(error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  };

  // =========================
  // Logout
  // =========================

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error.message);
      return;
    }
    navigate("/");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        handleLogin,
        handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
