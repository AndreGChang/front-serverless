import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, Container } from "@mui/material";
import Pedidos from "./pages/Pedidos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";

const App: React.FC = () => {
  return (
    <Router>
      <CssBaseline />
      <Container>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pedidos" element={<PrivateRoute element={<Pedidos />} />} />
          {/* <Route path="/pedidos" element={<PrivateRoute element={<Pedidos />} />} /> */}
          <Route path="*" element={<Login />} /> {/* Redireciona para login caso rota não exista */}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
