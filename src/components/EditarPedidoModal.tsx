import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, IconButton, Snackbar, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { auth } from "../firebaseconfig"; // Importa a autenticação do Firebase

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

// URL da API vinda do .env
const API_URL_UPDATE_PEDIDO = import.meta.env.VITE_API_URL_UPDATE_PEDIDO;

const EditarPedidoModal: React.FC<EditarPedidoModalProps> = ({ pedido, open, onClose, onPedidoAtualizado }) => {
    const [cliente, setCliente] = useState("");
    const [email, setEmail] = useState("");
    const [itens, setItens] = useState<ItemPedido[]>([]);
    const [novoItem, setNovoItem] = useState<ItemPedido>({ id: "", produto: "", quantidade: 1, preco: 0 });
    const [itemEditando, setItemEditando] = useState<ItemPedido | null>(null);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [alerta, setAlerta] = useState<{ message: string; severity: "success" | "error" | "info" | "warning" | null }>({ message: "", severity: null });

    useEffect(() => {
        if (pedido && open) {
            setCliente(pedido.cliente || "");
            setEmail(pedido.email || "");
            setItens(pedido.itens ? [...pedido.itens] : []);
            setTotal(pedido.total || 0);
        }
    }, [pedido, open]);

    if (!pedido) return null;

    const recalcularTotal = (itensAtualizados: ItemPedido[]) => {
        const novoTotal = itensAtualizados.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
        setTotal(novoTotal);
    };

    const handleUpdatePedido = async () => {
        if (!cliente || !email || itens.length === 0) {
            setAlerta({ message: "Preencha todos os campos e adicione pelo menos um item", severity: "warning" });
            return;
        }
    
        const user = auth.currentUser;
        if (!user) {
            setAlerta({ message: "Usuário não autenticado.", severity: "error" });
            return;
        }
    
        const token = await user.getIdToken();
    
        const pedidoAtualizado = { cliente, email, itens, total };
    
        try {
            const response = await fetch(`${API_URL_UPDATE_PEDIDO}/pedidos/${pedido.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(pedidoAtualizado),
            });
    
            if (!response.ok) throw new Error("Erro ao atualizar pedido");
    
            setAlerta({ message: "Pedido atualizado com sucesso!", severity: "success" });
            onPedidoAtualizado();
            onClose();
        } catch (error) {
            setAlerta({ message: "Erro ao atualizar o pedido", severity: "error" });
        }
    };
    

    const adicionarItem = () => {
        if (novoItem.produto.trim() === "" || novoItem.preco <= 0 || novoItem.quantidade <= 0) {
            setAlerta({ message: "Preencha os campos corretamente para adicionar um item.", severity: "warning" });
            return;
        }
        const novosItens = [...itens, { ...novoItem, id: crypto.randomUUID() }];
        setItens(novosItens);
        recalcularTotal(novosItens);
        setNovoItem({ id: "", produto: "", quantidade: 1, preco: 0 });
    };

    const removerItem = (id: string) => {
        const novosItens = itens.filter((item) => item.id !== id);
        setItens(novosItens);
        recalcularTotal(novosItens);
    };

    const handleEditarItem = (item: ItemPedido) => {
        setItemEditando(item);
        setIsEditItemModalOpen(true);
    };

    const handleSalvarItemEditado = () => {
        if (!itemEditando) return;

        const itensAtualizados = itens.map((item) =>
            item.id === itemEditando.id ? itemEditando : item
        );
        setItens(itensAtualizados);
        recalcularTotal(itensAtualizados);
        setIsEditItemModalOpen(false);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>Editar Pedido</DialogTitle>
                <DialogContent>
                    <TextField label="Nome do Cliente" fullWidth margin="dense" value={cliente} onChange={(e) => setCliente(e.target.value)} />
                    <TextField label="Email" fullWidth margin="dense" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <p><strong>Total Atualizado:</strong> R$ {total.toFixed(2)}</p>

                    <h3>Itens do Pedido</h3>
                    <List>
                        {itens.length > 0 ? (
                            itens.map((item) => (
                                <ListItem key={item.id} secondaryAction={
                                    <>
                                        <IconButton color="primary" onClick={() => handleEditarItem(item)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => removerItem(item.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                }>
                                    {item.produto} - {item.quantidade}x - R$ {item.preco.toFixed(2)}
                                </ListItem>
                            ))
                        ) : (
                            <p style={{ color: "red" }}>Nenhum item encontrado no pedido.</p>
                        )}
                    </List>

                    <TextField label="Produto" fullWidth margin="dense" value={novoItem.produto} onChange={(e) => setNovoItem({ ...novoItem, produto: e.target.value })} />
                    <TextField label="Quantidade" type="number" fullWidth margin="dense" value={novoItem.quantidade} onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseInt(e.target.value) })} />
                    <TextField label="Preço" type="number" fullWidth margin="dense" value={novoItem.preco} onChange={(e) => setNovoItem({ ...novoItem, preco: parseFloat(e.target.value) })} />

                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={adicionarItem} sx={{ mt: 2 }}>Adicionar Item</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="error">Cancelar</Button>
                    <Button onClick={handleUpdatePedido} color="primary" variant="contained">Salvar Alterações</Button>
                </DialogActions>
            </Dialog>


            {itemEditando && (
                <Dialog open={isEditItemModalOpen} onClose={() => setIsEditItemModalOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Editar Item</DialogTitle>
                    <DialogContent>
                        <TextField label="Produto" fullWidth margin="dense" value={itemEditando.produto} onChange={(e) => setItemEditando({ ...itemEditando, produto: e.target.value })} />
                        <TextField label="Quantidade" type="number" fullWidth margin="dense" value={itemEditando.quantidade} onChange={(e) => setItemEditando({ ...itemEditando, quantidade: parseInt(e.target.value) })} />
                        <TextField label="Preço" type="number" fullWidth margin="dense" value={itemEditando.preco} onChange={(e) => setItemEditando({ ...itemEditando, preco: parseFloat(e.target.value) })} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsEditItemModalOpen(false)} color="error">Cancelar</Button>
                        <Button onClick={handleSalvarItemEditado} color="primary" variant="contained">Salvar</Button>
                    </DialogActions>
                </Dialog>
            )}

            <Snackbar open={!!alerta.severity} autoHideDuration={3000} onClose={() => setAlerta({ message: "", severity: null })}>
                {alerta.severity ? ( <Alert severity={alerta.severity}>{alerta.message}</Alert>) : undefined}
            </Snackbar>
        </>
    );
};

export default EditarPedidoModal;
