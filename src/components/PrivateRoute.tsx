import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { CircularProgress, Container } from "@mui/material";

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log("Usuário autenticado:", user);
        setUser(user ? true : false);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <CircularProgress />
      </Container>
    );
  }

  return user ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
