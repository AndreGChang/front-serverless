import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, IconButton, Alert, Snackbar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { Pedido, ItemPedido } from "../types";


// const API_URL_CRIAR_PEDIDO = `https://salvar-pedido-155688859997.us-central1.run.app/pedidos`;

const API_URL_CRIAR_PEDIDO = import.meta.env.VITE_API_URL_CRIAR_PEDIDO;


interface CriarPedidoModalProps {
    open: boolean;
    onClose: () => void; 
    onPedidoCriado: (novoPedido: Pedido) => void;
}

const CriarPedidoModal: React.FC<CriarPedidoModalProps> = ({ open, onClose, onPedidoCriado }) => {
    const [cliente, setCliente] = useState("");
    const [email, setEmail] = useState("");
    const [itens, setItens] = useState<ItemPedido[]>([]);
    const [novoItem, setNovoItem] = useState<ItemPedido>({ id: "", produto: "", quantidade: 1, preco: 0 });
    const [alerta, setAlerta] = useState<{ message: string; severity: "success" | "error" | "info" | "warning" | null }>({ message: "", severity: null });
    

    const adicionarItem = () => {
        if (!novoItem.produto.trim() || novoItem.preco <= 0 || novoItem.quantidade <= 0) {
            setAlerta({ message: "Preencha os campos corretamente para adicionar um item.", severity: "warning" });
            return;
        }

        setItens([...itens, { ...novoItem, id: crypto.randomUUID() }]); // Gera um ID único para cada item
        setNovoItem({ id: "", produto: "", quantidade: 1, preco: 0 }); // Resetando o formulário de itens
    };

    const removerItem = (id: string) => {
        setItens(itens.filter((item) => item.id !== id));
    };

    const handleCriarPedido = async () => {
        if (!cliente || !email || itens.length === 0) {
            setAlerta({ message: "Preencha todos os campos e adicione pelo menos um item.", severity: "warning" });

            return;
        }
    
        // Calcula o total do pedido
        const totalPedido = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    
        const pedido = {
            cliente,
            email,
            itens,
            total: totalPedido,
            status: "PENDENTE",
        };
    
        try {
            const response = await fetch(`${API_URL_CRIAR_PEDIDO}/salvar_pedido`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedido),
            });
    
            if (!response.ok) throw new Error("Erro ao criar pedido");
    
            const data: Pedido = await response.json();
            setAlerta({ message: "Pedido criado com sucesso! ID: ${data.id}", severity: "success" });
    
            
            onPedidoCriado(data);
    
            
            setCliente("");
            setEmail("");
            setItens([]);
    
            onClose();
        } catch (error) {
            setAlerta({ message: "Erro ao atualizar o pedido", severity: "error" });
        }
    };
    

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Criar Novo Pedido</DialogTitle>
            <DialogContent>
                <TextField
                    label="Nome do Cliente"
                    fullWidth
                    margin="dense"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                />
                <TextField
                    label="Email"
                    fullWidth
                    margin="dense"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <h3>Itens do Pedido</h3>
                <List>
                    {itens.length > 0 ? (
                        itens.map((item) => (
                            <ListItem key={item.id} secondaryAction={
                                <IconButton edge="end" color="error" onClick={() => removerItem(item.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }>
                                {item.produto} - {item.quantidade}x - R$ {item.preco.toFixed(2)}
                            </ListItem>
                        ))
                    ) : (
                        <p style={{ color: "red" }}>Nenhum item adicionado.</p>
                    )}
                </List>

                <h3>Adicionar Item</h3>
                <TextField
                    label="Produto"
                    fullWidth
                    margin="dense"
                    value={novoItem.produto}
                    onChange={(e) => setNovoItem({ ...novoItem, produto: e.target.value })}
                />
                <TextField
                    label="Quantidade"
                    type="number"
                    fullWidth
                    margin="dense"
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseInt(e.target.value) || 1 })}
                />
                <TextField
                    label="Preço"
                    type="number"
                    fullWidth
                    margin="dense"
                    value={novoItem.preco}
                    onChange={(e) => setNovoItem({ ...novoItem, preco: parseFloat(e.target.value) || 0 })}
                />

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={adicionarItem}
                    sx={{ mt: 2 }}
                >
                    Adicionar Item
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="error">Cancelar</Button>
                <Button onClick={handleCriarPedido} color="primary" variant="contained">Criar Pedido</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CriarPedidoModal;
