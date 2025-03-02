import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, CircularProgress } from "@mui/material";
import { auth } from "../firebaseConfig"; // Importa Firebase Auth

// Interface para tipagem do pedido
interface Pedido {
    id: string;
    status: string;
}

interface AlterarStatusModalProps {
    pedido: Pedido | null;
    open: boolean;
    onClose: () => void;
    onStatusAtualizado: (novoStatus: string) => Promise<void>;
}

const statusPossiveis = ["PENDENTE", "PROCESSANDO", "ENVIADO", "CANCELADO"];

const AlterarStatusModal: React.FC<AlterarStatusModalProps> = ({ pedido, open, onClose, onStatusAtualizado }) => {
    const [alerta, setAlerta] = useState<{ message: string; severity: "success" | "error" | "info" | "warning" | null }>({ message: "", severity: null });
    const [statusSelecionado, setStatusSelecionado] = useState("");
    const [carregando, setCarregando] = useState(false); // Estado para bloquear múltiplos cliques

    const API_URL_ATUALIZAR_STATUS = import.meta.env.VITE_API_URL_ATUALIZAR_STATUS;

    // Atualizar estado quando abrir o modal
    useEffect(() => {
        if (pedido) {
            setStatusSelecionado(pedido.status);
        }
    }, [pedido]);

    if (!pedido) return null;

    const handleAlterarStatus = async () => {
        if (!statusSelecionado) {
            setAlerta({ message: "Selecione um status.", severity: "warning" });
            return;
        }
    
        setCarregando(true); // Ativa o estado de carregamento
    
        try {
            // Verifica se o usuário está autenticado
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");
    
            // Obtém o token JWT do Firebase
            const token = await user.getIdToken();
    
            // Faz a requisição para atualizar o status do pedido
            const response = await fetch(`${API_URL_ATUALIZAR_STATUS}/${pedido.id}`, {
                method: "PUT", // Se a API aceitar PATCH, altere para "PATCH"
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Token JWT no cabeçalho
                },
                body: JSON.stringify({ status: statusSelecionado }),
            });
    
            if (!response.ok) throw new Error("Erro ao atualizar status");
    
            // Atualiza o estado global com o novo status
            await onStatusAtualizado(statusSelecionado);
    
            // Mostra alerta de sucesso
            setAlerta({ message: "Status atualizado com sucesso!", severity: "success" });
    
            // Fecha a modal
            onClose();
        } catch (error) {
            setAlerta({ message: "Erro ao atualizar status. Tente novamente.", severity: "error" });
        } finally {
            setCarregando(false); // Desativa o estado de carregamento
        }
    };
    

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Alterar Status do Pedido</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusSelecionado}
                            onChange={(e) => setStatusSelecionado(e.target.value)}
                        >
                            {statusPossiveis.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="error" disabled={carregando}>
                        Cancelar
                    </Button>
                    <Button onClick={handleAlterarStatus} color="primary" variant="contained" disabled={carregando}>
                        {carregando ? <CircularProgress size={24} color="inherit" /> : "Salvar"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!alerta.severity}
                autoHideDuration={3000}
                onClose={() => setAlerta({ message: "", severity: null })}
            >
                {alerta.severity ? (
                    <Alert severity={alerta.severity} onClose={() => setAlerta({ message: "", severity: null })}>
                        {alerta.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </>
    );
};

export default AlterarStatusModal;
