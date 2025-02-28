import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Interfaces para tipagem
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

interface EditarPedidoModalProps {
    pedido: Pedido | null;
    open: boolean;
    onClose: () => void;
    onPedidoAtualizado: () => void;
}

const EditarPedidoModal: React.FC<EditarPedidoModalProps> = ({ pedido, open, onClose, onPedidoAtualizado }) => {
    const [cliente, setCliente] = useState("");
    const [email, setEmail] = useState("");
    const [itens, setItens] = useState<ItemPedido[]>([]);
    const [novoItem, setNovoItem] = useState<ItemPedido>({ id: "", produto: "", quantidade: 1, preco: 0 });

    const API_URL_UPDATE_PEDIDO = "https://aualizar-status-pedido-155688859997.us-central1.run.app/pedidos";

    // Atualizar os estados quando o modal abrir
    useEffect(() => {
        if (pedido && open) {
            console.log("Pedido recebido para edição:", pedido); // Debugging
            setCliente(pedido.cliente || "");
            setEmail(pedido.email || "");
            setItens(pedido.itens ? [...pedido.itens] : []); // Clonar os itens para evitar mutações
        }
    }, [pedido, open]);

    // Se o pedido ainda não estiver carregado, não renderiza nada
    if (!pedido) return null;

    // Adicionar um novo item ao pedido
    const adicionarItem = () => {
        if (novoItem.produto.trim() === "" || novoItem.preco <= 0 || novoItem.quantidade <= 0) {
            alert("Preencha os campos corretamente para adicionar um item.");
            return;
        }
        setItens([...itens, { ...novoItem, id: crypto.randomUUID() }]);
        setNovoItem({ id: "", produto: "", quantidade: 1, preco: 0 });
    };

    // Remover um item do pedido
    const removerItem = (id: string) => {
        setItens(itens.filter((item) => item.id !== id));
    };

    // Atualizar o pedido na API
    const handleUpdatePedido = async () => {
        if (!cliente || !email || itens.length === 0) {
            alert("Preencha todos os campos e adicione pelo menos um item.");
            return;
        }

        const pedidoAtualizado = { cliente, email, itens };

        try {
            const response = await fetch(`${API_URL_UPDATE_PEDIDO}/${pedido.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedidoAtualizado),
            });

            if (!response.ok) throw new Error("Erro ao atualizar pedido");

            alert("Pedido atualizado com sucesso!");

            onPedidoAtualizado();
            onClose();
        } catch (error) {
            alert("Erro ao atualizar pedido. Tente novamente.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Editar Pedido</DialogTitle>
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
                        <p style={{ color: "red" }}>Nenhum item encontrado no pedido.</p>
                    )}
                </List>

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
                    onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseInt(e.target.value) })}
                />
                <TextField
                    label="Preço"
                    type="number"
                    fullWidth
                    margin="dense"
                    value={novoItem.preco}
                    onChange={(e) => setNovoItem({ ...novoItem, preco: parseFloat(e.target.value) })}
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
                <Button onClick={handleUpdatePedido} color="primary" variant="contained">Salvar Alterações</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditarPedidoModal;
