import React, { useState, useEffect } from "react";
import { Container, Typography, Button, List, ListItem, ListItemText, IconButton, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"; import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UpdateIcon from "@mui/icons-material/Update";
import PedidoDetalhesModal from "../components/PedidosDetalheModal";
import CriarPedidoModal from "../components/CriarPedidoModal";
import EditarPedidoModal from "../components/EditarPedidoModal";
import AlterarStatusModal from "../components/AlterarStatusModal";
import { Pedido } from "../types";
import { auth } from "../firebaseconfig";
import { useNavigate } from "react-router-dom";

const Pedidos: React.FC = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [pedidoDetalhado, setPedidoDetalhado] = useState<Pedido | null>(null);
    const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
    const [pedidoAlterandoStatus, setPedidoAlterandoStatus] = useState<Pedido | null>(null);
    const [pedidoDeletando, setPedidoDeletando] = useState<Pedido | null>(null);
    const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isCriarModalOpen, setIsCriarModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [alerta, setAlerta] = useState<{ message: string; severity: "success" | "error" | "info" | "warning" | null }>({ message: "", severity: null });


    // const API_URL_LISTAR_PEDIDOS = "https://listar-pedidos-155688859997.us-central1.run.app/pedidos";
    // const API_URL_DETALHAR_PEDIDO = "https://detalhar-pedido-155688859997.us-central1.run.app/pedidos";
    // const API_URL_DELETAR_PEDIDO = "https://delete-pedido-155688859997.us-central1.run.app/pedidos";


    const API_URL_LISTAR_PEDIDOS = import.meta.env.VITE_API_URL_LISTAR_PEDIDOS;
    const API_URL_DETALHAR_PEDIDO = import.meta.env.VITE_API_URL_DETALHAR_PEDIDO;
    const API_URL_DELETAR_PEDIDO = import.meta.env.VITE_API_URL_DELETAR_PEDIDO;

    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    };

    // Buscar pedidos do backend
    const fetchPedidos = async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            const token = await user.getIdToken();
            console.log("Token JWT:", token);

            const response = await fetch(`${API_URL_LISTAR_PEDIDOS}/listar_pedidos`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar pedidos");

            const data = await response.json();
            setPedidos(data);
            setAlerta({ message: "Pedidos carregados com sucesso!", severity: "success" });
        } catch (error) {
            setAlerta({ message: "Erro ao buscar pedidos", severity: "error" });
        }
    };



    useEffect(() => {
        fetchPedidos();
    }, []);

    const handleCriarPedido = async (novoPedido: Pedido) => {
        setPedidos((prevPedidos) => [...prevPedidos, novoPedido]);
        fetchPedidos();
    };


    const handleDetalharPedido = async (id: string) => {
        try {
            // Obtém o usuário autenticado
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            // Obtém o token JWT do Firebase
            const token = await user.getIdToken();

            // Faz a requisição para buscar os detalhes do pedido
            const response = await fetch(`${API_URL_DETALHAR_PEDIDO}/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Envia o token JWT no cabeçalho
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar detalhes do pedido");

            // Converte a resposta para JSON
            const data = await response.json();

            // Atualiza o estado para abrir o modal com os dados do pedido
            setPedidoDetalhado(data);
            setIsDetalhesModalOpen(true);
        } catch (error) {
            setAlerta({ message: "Erro ao detalhar pedido", severity: "error" });
        }
    };


    const handleEditarPedido = async (id: string) => {
        try {
            // Obtém o usuário autenticado
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            // Obtém o token JWT do Firebase
            const token = await user.getIdToken();

            // Faz a requisição para buscar os detalhes do pedido
            const response = await fetch(`${API_URL_DETALHAR_PEDIDO}/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Envia o token JWT no cabeçalho
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar detalhes do pedido");

            // Converte a resposta para JSON
            const data = await response.json();

            // Atualiza o estado para abrir o modal de edição
            setPedidoEditando(data);
            setIsEditModalOpen(true);
        } catch (error) {
            setAlerta({ message: "Erro ao editar pedido", severity: "error" });
        }
    };

    const handleAlterarStatus = async (pedido: Pedido, novoStatus: string) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuário não autenticado");

            const token = await user.getIdToken();

            const response = await fetch(`${import.meta.env.VITE_API_URL_ATUALIZAR_STATUS}/${pedido.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (!response.ok) throw new Error("Erro ao atualizar status do pedido");

            setPedidos((prevPedidos) =>
                prevPedidos.map((p) => (p.id === pedido.id ? { ...p, status: novoStatus } : p))
            );

            setAlerta({ message: "Status do pedido atualizado!", severity: "success" });
        } catch (error) {
            setAlerta({ message: "Erro ao atualizar o status do pedido", severity: "error" });
        }
        setIsStatusModalOpen(false);
    };

    const handleDeletePedido = async () => {
        if (!pedidoDeletando) return;

        const user = auth.currentUser;
        if (!user) {
            setAlerta({ message: "Usuário não autenticado.", severity: "error" });
            return;
        }

        const token = await user.getIdToken();

        try {
            const response = await fetch(`${API_URL_DELETAR_PEDIDO}/${pedidoDeletando.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Erro ao deletar pedido");

            setPedidos(pedidos.filter((pedido) => pedido.id !== pedidoDeletando.id));
            setAlerta({ message: "Pedido deletado com sucesso!", severity: "success" });
        } catch (error) {
            setAlerta({ message: "Erro ao deletar o pedido", severity: "error" });
        }
        setIsDeleteModalOpen(false);
    };



    return (
        <Container>
            <Button onClick={handleLogout} variant="contained" color="secondary">
                Sair
            </Button>
            <Typography variant="h4" gutterBottom>Listar Pedidos</Typography>
            <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={() => setIsCriarModalOpen(true)}>
                Criar Pedido
            </Button>

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

            <List>
                {pedidos.map((pedido) => (
                    <ListItem key={pedido.id} divider>
                        <ListItemText primary={`${pedido.cliente} - R$ ${pedido.total.toFixed(2)} - Status: ${pedido.status}`} />


                        <IconButton color="info" onClick={() => handleDetalharPedido(pedido.id)}>
                            <VisibilityIcon />
                        </IconButton>


                        <IconButton color="primary" onClick={() => handleEditarPedido(pedido.id)}>
                            <EditIcon />
                        </IconButton>


                        <IconButton color="warning" onClick={() => {
                            setPedidoAlterandoStatus(pedido);  // Define o pedido atual
                            setIsStatusModalOpen(true);  // Abre a modal
                        }}>
                            <UpdateIcon />
                        </IconButton>


                        <IconButton color="error" onClick={() => { setPedidoDeletando(pedido); setIsDeleteModalOpen(true); }}>
                            <DeleteIcon />
                        </IconButton>

                    </ListItem>
                ))}
            </List>

            {/* Modais */}
            <CriarPedidoModal open={isCriarModalOpen} onClose={() => setIsCriarModalOpen(false)} onPedidoCriado={handleCriarPedido} />
            <PedidoDetalhesModal pedido={pedidoDetalhado} open={isDetalhesModalOpen} onClose={() => setIsDetalhesModalOpen(false)} />
            <EditarPedidoModal pedido={pedidoEditando} open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onPedidoAtualizado={fetchPedidos} />
            {/* <AlterarStatusModal pedido={pedidoAlterandoStatus} open={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} onStatusAtualizado={fetchPedidos} /> */}
            <AlterarStatusModal
                pedido={pedidoAlterandoStatus}
                open={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onStatusAtualizado={async (novoStatus) => await handleAlterarStatus(pedidoAlterandoStatus!, novoStatus)}
            />

            {/* Modal de Confirmação de Delete */}
            <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    Tem certeza que deseja excluir este pedido?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteModalOpen(false)} color="secondary">Não</Button>
                    <Button onClick={handleDeletePedido} color="error" variant="contained">Sim</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default Pedidos;
