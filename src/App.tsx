import React from "react";
import { CssBaseline, Container } from "@mui/material";
import Pedidos from "./components/Pedidos";

const App: React.FC = () => {
    return (
        <>
            <CssBaseline /> {/* Reseta estilos para manter a interface padronizada */}
            <Container>
                <Pedidos />
            </Container>
        </>
    );
};

export default App;
