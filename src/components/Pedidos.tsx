import React, { useState, useEffect } from "react";
import { Container, Typography, Button, List, ListItem, ListItemText, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UpdateIcon from "@mui/icons-material/Update";
// import PedidoDetalhesModal from "./PedidosDetalheModal";
import PedidoDetalhesModal from "./PedidoDetalhesModal";
import CriarPedidoModal from "./CriarPedidoModal";
import EditarPedidoModal from "./EditarPedidoModal";
import AlterarStatusModal from "./AlterarStatusModal";
import { Pedido } from "../types";

const Pedidos: React.FC = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [pedidoDetalhado, setPedidoDetalhado] = useState<Pedido | null>(null);
    const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
    const [pedidoAlterandoStatus, setPedidoAlterandoStatus] = useState<Pedido | null>(null);
    const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isCriarModalOpen, setIsCriarModalOpen] = useState(false);

    const API_URL_LISTAR_PEDIDOS = "https://listar-pedidos-155688859997.us-central1.run.app/pedidos";
    const API_URL_DETALHAR_PEDIDO = "https://detalhar-pedido-155688859997.us-central1.run.app/pedidos";
    const API_URL_DELETAR_PEDIDO = "https://delete-pedido-155688859997.us-central1.run.app/pedidos";

    // Buscar pedidos do backend
    const fetchPedidos = async () => {
        try {
            const response = await fetch(`${API_URL_LISTAR_PEDIDOS}/listar_pedidos`);
            if (!response.ok) throw new Error("Erro ao buscar pedidos");
            const data = await response.json();
            setPedidos(data);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
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
            const response = await fetch(`${API_URL_DETALHAR_PEDIDO}/${id}`);
            if (!response.ok) throw new Error("Erro ao buscar detalhes do pedido");
            const data = await response.json();
            setPedidoDetalhado(data);
            setIsDetalhesModalOpen(true);
        } catch (error) {
            console.error("Erro ao buscar detalhes do pedido:", error);
        }
    };

    const handleEditarPedido = async (id: string) => {
        try {
            const response = await fetch(`${API_URL_DETALHAR_PEDIDO}/${id}`);
            if (!response.ok) throw new Error("Erro ao buscar detalhes do pedido");
            const data = await response.json();
            setPedidoEditando(data);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error("Erro ao buscar detalhes do pedido:", error);
        }
    };

    const handleAlterarStatus = (pedido: Pedido) => {
        setPedidoAlterandoStatus(pedido);
        setIsStatusModalOpen(true);
    };

    const handleDeletePedido = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este pedido?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL_DELETAR_PEDIDO}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Erro ao deletar pedido");

            setPedidos(pedidos.filter((pedido) => pedido.id !== id));
            alert("Pedido deletado com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            alert("Erro ao excluir o pedido. Tente novamente.");
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Listar Pedidos</Typography>
            <Button variant="contained" color="success" onClick={() => setIsCriarModalOpen(true)}>➕ Criar Pedido</Button>

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

                        
                        <IconButton color="warning" onClick={() => handleAlterarStatus(pedido)}>
                            <UpdateIcon />
                        </IconButton>

                        
                        <IconButton color="error" onClick={() => handleDeletePedido(pedido.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            {/* Modais */}
            <CriarPedidoModal open={isCriarModalOpen} onClose={() => setIsCriarModalOpen(false)} onPedidoCriado={handleCriarPedido} />
            <PedidoDetalhesModal pedido={pedidoDetalhado} open={isDetalhesModalOpen} onClose={() => setIsDetalhesModalOpen(false)} />
            <EditarPedidoModal pedido={pedidoEditando} open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onPedidoAtualizado={fetchPedidos} />
            <AlterarStatusModal pedido={pedidoAlterandoStatus} open={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} onStatusAtualizado={fetchPedidos} />
        </Container>
    );
};

export default Pedidos;
