import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemText, Alert, Snackbar } from "@mui/material";
import { auth } from "../firebaseconfig"; // Importa Firebase Auth

// Interface para tipagem do pedido
interface ItemPedido {
    id: string;
    produto: string;
    quantidade: number;
    preco: number;
}

interface Pedido {
    id: string;
    cliente: string;
    email?: string;
    itens?: ItemPedido[];
    total: number;
    status: string;
    data_criacao?: string;
}

interface PedidoDetalhesModalProps {
    pedido: Pedido | null;
    open: boolean;
    onClose: () => void;
}

// URL da API do detalhamento do pedido vinda do .env
const API_URL_DETALHAR_PEDIDO = import.meta.env.VITE_API_URL_DETALHAR_PEDIDO;

const PedidoDetalhesModal: React.FC<PedidoDetalhesModalProps> = ({ pedido, open, onClose }) => {
    const [pedidoDetalhado, setPedidoDetalhado] = useState<Pedido | null>(null);
    const [alerta, setAlerta] = useState<{ message: string; severity: "success" | "error" | "info" | "warning" | null }>({ message: "", severity: null });

    useEffect(() => {

        if (open && pedido?.id) {
            console.log("✅ Chamando buscarDetalhesPedido para o pedido:", pedido.id);
            buscarDetalhesPedido(pedido.id);
        }
    }, [open, pedido]);

    
    const buscarDetalhesPedido = async (pedidoId: string) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                setAlerta({ message: "Usuário não autenticado.", severity: "error" });
                return;
            }

            // Obtém o token atualizado
            const token = await user.getIdToken(true);
            console.log("Token JWT:", token); // Debug: Verifica se o token está correto

            const response = await fetch(`${API_URL_DETALHAR_PEDIDO}/${pedidoId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Envia o token corretamente
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar detalhes do pedido. Código ${response.status}`);
            }

            const data: Pedido = await response.json();
            setPedidoDetalhado(data);
        } catch (error) {
            console.error("Erro ao obter detalhes do pedido:", error);
            setAlerta({ message: "Erro ao obter os detalhes do pedido.", severity: "error" });
        }
    };

    const calcularTotal = (itens: ItemPedido[] | undefined) => {
        if (!itens) return 0;
        return itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    };

    if (!pedidoDetalhado) return null;

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Detalhes do Pedido</DialogTitle>
                <DialogContent>
                    <p><strong>ID:</strong> {pedidoDetalhado.id}</p>
                    <p><strong>Cliente:</strong> {pedidoDetalhado.cliente}</p>
                    <p><strong>Email:</strong> {pedidoDetalhado.email || "Não informado"}</p>
                    <p><strong>Total Atualizado:</strong> R$ {calcularTotal(pedidoDetalhado.itens).toFixed(2)}</p>
                    <p><strong>Status:</strong> {pedidoDetalhado.status}</p>
                    <p><strong>Data de Criação:</strong> {pedidoDetalhado.data_criacao ? new Date(pedidoDetalhado.data_criacao).toLocaleString() : "Não disponível"}</p>

                    <h3>Itens:</h3>
                    {pedidoDetalhado.itens && pedidoDetalhado.itens.length > 0 ? (
                        <List>
                            {pedidoDetalhado.itens.map((item) => (
                                <ListItemText key={item.id} primary={`${item.produto} - ${item.quantidade}x - R$ ${item.preco.toFixed(2)}`} />
                            ))}
                        </List>
                    ) : (
                        <p style={{ color: "red" }}>Nenhum item encontrado.</p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="error" variant="contained">Fechar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={!!alerta.severity} autoHideDuration={3000} onClose={() => setAlerta({ message: "", severity: null })}>
                {alerta.severity ? <Alert severity={alerta.severity}>{alerta.message}</Alert> : undefined}
            </Snackbar>
        </>
    );
};

export default PedidoDetalhesModal;
