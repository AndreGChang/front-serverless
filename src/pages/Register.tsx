import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Alert, Stack, Paper } from "@mui/material";

const API_URL_REGISTRAR = import.meta.env.VITE_API_URL_REGISTRAR;

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const response = await fetch(API_URL_REGISTRAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Erro ao registrar usuário");

      setSuccess("Usuário registrado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Erro ao registrar. Verifique os dados e tente novamente.");
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: "50px", textAlign: "center" }}>
      <Paper elevation={3} style={{ padding: "20px", borderRadius: "10px" }}>
        <Typography variant="h4" gutterBottom>Registro</Typography>

        <Stack sx={{ width: '100%' }} spacing={2}>
          {error && <Alert variant="filled" severity="error">{error}</Alert>}
          {success && <Alert variant="filled" severity="success">{success}</Alert>}
        </Stack>

        <form onSubmit={handleRegister}>
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
            helperText="A senha deve ter pelo menos 6 caracteres."
          />
          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: "10px" }}>
            Registrar
          </Button>
        </form>

        <Typography variant="body2" style={{ marginTop: "10px" }}>
          Já tem uma conta? <a href="/login">Faça login aqui</a>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
