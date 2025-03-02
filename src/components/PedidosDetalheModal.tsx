import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, IconButton, TextField } from "@mui/material";


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

const PedidoDetalhesModal: React.FC<PedidoDetalhesModalProps> = ({ pedido, open, onClose }) => {

    const calcularTotal = (itens: ItemPedido[] | undefined) => {
        if (!itens) return 0;
        return itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    };

    if (!pedido) return null;

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Detalhes do Pedido</DialogTitle>
                <DialogContent>
                    <p><strong>ID:</strong> {pedido.id}</p>
                    <p><strong>Cliente:</strong> {pedido.cliente}</p>
                    <p><strong>Email:</strong> {pedido.email || "Não informado"}</p>
                    <p><strong>Total Atualizado:</strong> R$ {calcularTotal(pedido.itens).toFixed(2)}</p>
                    <p><strong>Status:</strong> {pedido.status}</p>
                    <p><strong>Data de Criação:</strong> {pedido.data_criacao ? new Date(pedido.data_criacao).toLocaleString() : "Não disponível"}</p>

                    <h3>Itens:</h3>
                    {pedido.itens && pedido.itens.length > 0 ? (
                        <List>
                            {pedido.itens.map((item) => (
                                    <ListItemText primary={`${item.produto} - ${item.quantidade}x - R$ ${item.preco.toFixed(2)}`} />
                                    
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


        </>
    );
};

export default PedidoDetalhesModal;
