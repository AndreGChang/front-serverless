import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

// Interface para tipagem do pedido
interface Pedido {
    id: string;
    status: string;
}

interface AlterarStatusModalProps {
    pedido: Pedido | null;
    open: boolean;
    onClose: () => void;
    onStatusAtualizado: () => void;
}

const statusPossiveis = ["PENDENTE", "PROCESSANDO", "ENVIADO", "CANCELADO"];

const AlterarStatusModal: React.FC<AlterarStatusModalProps> = ({ pedido, open, onClose, onStatusAtualizado }) => {
    const [statusSelecionado, setStatusSelecionado] = useState("");

    const API_URL_ATUALIZAR_STATUS = "https://aualizar-status-pedido-155688859997.us-central1.run.app/pedidos";

    // Atualizar estado quando abrir o modal
    useEffect(() => {
        if (pedido) {
            setStatusSelecionado(pedido.status);
        }
    }, [pedido]);

    if (!pedido) return null;

    const handleAlterarStatus = async () => {
        if (!statusSelecionado) {
            alert("Selecione um status.");
            return;
        }

        try {
            const response = await fetch(`${API_URL_ATUALIZAR_STATUS}/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: statusSelecionado }),
            });

            if (!response.ok) throw new Error("Erro ao atualizar status");

            alert("Status atualizado com sucesso!");
            onStatusAtualizado();
            onClose();
        } catch (error) {
            alert("Erro ao atualizar status. Tente novamente.");
        }
    };

    return (
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
                <Button onClick={onClose} color="error">Cancelar</Button>
                <Button onClick={handleAlterarStatus} color="primary" variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AlterarStatusModal;
