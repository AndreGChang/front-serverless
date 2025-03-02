import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Alert, Stack, Paper } from "@mui/material";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebaseConfig";

const API_URL_LOGAR = import.meta.env.VITE_API_URL_LOGAR;
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    try {
      const response = await fetch(API_URL_LOGAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) throw new Error("Credenciais inválidas");
  
      const data = await response.json();
  
      // Envia o token para o Firebase para autenticação
      const userCredential = await signInWithCustomToken(auth, data.token);
      const idToken = await userCredential.user.getIdToken(); // Obtém o ID Token final
  
      // Agora sim podemos armazenar o token JWT correto
      localStorage.setItem("token", idToken);
      
      navigate("/pedidos"); // Redireciona para a página de pedidos
    } catch (err) {
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: "50px", textAlign: "center" }}>
      <Paper elevation={3} style={{ padding: "20px", borderRadius: "10px" }}>
        <Typography variant="h4" gutterBottom>Login</Typography>

        <Stack sx={{ width: '100%' }} spacing={2}>
          {error && <Alert variant="filled" severity="error">{error}</Alert>}
        </Stack>

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: "10px" }}>
            Entrar
          </Button>
        </form>

        <Typography variant="body2" style={{ marginTop: "10px" }}>
          Ainda não tem uma conta? <a href="/register">Registre-se aqui</a>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
