import React from "react";
import CriarPedido from "./components/Pedidos.tsx";

const App: React.FC = () => {
    return (
        <div style={{ height: "100vh", width: "100vw", background: "#f4f4f4" }}>
            <CriarPedido />
        </div>
    );
};

export default App;
