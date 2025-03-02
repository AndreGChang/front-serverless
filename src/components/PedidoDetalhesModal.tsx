import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Card,
    Box,
    Stack,
    Divider,
    Typography,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import { Pedido } from "../types";

interface PedidoDetalhesModalProps {
    pedido: Pedido | null;
    open: boolean;
    onClose: () => void;
}

const PedidoDetalhesModal: React.FC<PedidoDetalhesModalProps> = ({ pedido, open, onClose }) => {
    if (!pedido) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogContent>
                <Card variant="outlined">
                    <Box sx={{ p: 2 }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                            <Typography gutterBottom variant="h5" component="div">
                                {pedido.cliente}
                            </Typography>
                            <Typography gutterBottom variant="h6" component="div">
                                Total: R$ {pedido.total.toFixed(2)}
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Status: {pedido.status}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Email: {pedido.email}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Criado em: {pedido.data_criacao ? new Date(pedido.data_criacao).toLocaleString() : "Não disponível"}
                        </Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ p: 2 }}>
                        <Typography gutterBottom variant="body2">
                            Itens do Pedido
                        </Typography>
                        <List>
                            {pedido.itens.length > 0 ? (
                                pedido.itens.map((item) => (
                                    <ListItem key={item.id}>
                                        <ListItemText
                                            primary={`${item.produto} - ${item.quantidade}x`}
                                            secondary={`Preço unitário: R$ ${item.preco.toFixed(2)}`}
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography color="error">Nenhum item encontrado.</Typography>
                            )}
                        </List>
                    </Box>
                </Card>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="error" variant="contained">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PedidoDetalhesModal;
