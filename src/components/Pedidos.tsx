import React, { useState, useEffect } from "react";
import "./Pedidos.css";

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
    email: string;
    itens: ItemPedido[];
    total: number;
    status: string;
    data_criacao: string;
}

const Pedidos: React.FC = () => {
    const [pedido, setPedido] = useState<Omit<Pedido, "id" | "total" | "status" | "data_criacao">>({
        cliente: "",
        email: "",
        itens: [],
    });
    

    const [novoItem, setNovoItem] = useState<Omit<ItemPedido, "id">>({
        produto: "",
        quantidade: 1,
        preco: 0,
    });

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [mensagem, setMensagem] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const API_URL_SALVAR_PEDIDOS = "https://salvar-pedido-155688859997.us-central1.run.app/pedidos";
    const API_URL_LISTAR_PEDIDOS = "https://listar-pedidos-155688859997.us-central1.run.app/pedidos";
    const API_URL_DELETAR_PEDIDOS = "https://delete-pedido-155688859997.us-central1.run.app/pedidos";

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

    const adicionarItem = () => {
        if (novoItem.produto.trim() === "" || novoItem.preco <= 0 || novoItem.quantidade <= 0) {
            return;
        }

        setPedido((prev) => ({
            ...prev,
            itens: [...prev.itens, { ...novoItem, id: crypto.randomUUID() }],
        }));

        setNovoItem({ produto: "", quantidade: 1, preco: 0 });
    };

    const removerItem = (id: string) => {
        setPedido((prev) => ({
            ...prev,
            itens: prev.itens.filter((item) => item.id !== id),
        }));
    };

    const handleItemChange = (field: keyof ItemPedido, value: string | number) => {
        setNovoItem((prev) => ({ ...prev, [field]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPedido((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensagem("");

        if (pedido.itens.length === 0) {
            setMensagem("Adicione pelo menos um item ao pedido.");
            return;
        }

        try {
            const response = await fetch(`${API_URL_SALVAR_PEDIDOS}/salvar_pedido`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedido),
            });

            if (!response.ok) throw new Error("Erro ao criar pedido");

            const data = await response.json();
            setMensagem(`Pedido criado com sucesso! ID: ${data.id}`);
            setPedido({ cliente: "", email: "", itens: [] });

            fetchPedidos();
        } catch (error) {
            setMensagem("Erro ao criar pedido. Tente novamente.");
        }
    };

    const handleDeletePedido = async (id: string) => {
        try {
            await fetch(`${API_URL_DELETAR_PEDIDOS}/${id}`, { method: "DELETE" });
            setPedidos(pedidos.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Erro ao excluir pedido:", error);
        }
    };

    return (
        <div className="container">
            {/* Itens adicionados ao pedido */}
            <div className="bloco verde">
                <h2>Itens Adicionados no Pedido</h2>
                {pedido.itens.length === 0 ? (
                    <p className="mensagem">Nenhum item adicionado.</p>
                ) : (
                    <ul className="lista-itens">
                        {pedido.itens.map((item) => (
                            <li key={item.id} className="item-lista">
                                <span>{item.produto} - {item.quantidade}x - R$ {item.preco.toFixed(2)}</span>
                                <button className="btn-deletar" onClick={() => removerItem(item.id)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Criar Pedido */}
            <div className="bloco vermelho">
                <h2>Criar Pedido</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nome do Cliente:</label>
                        <input type="text" name="cliente" value={pedido.cliente} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Email:</label>
                        <input type="email" name="email" value={pedido.email} onChange={handleChange} required />
                    </div>

                    <h3>Adicionar Item</h3>
                    <div className="item-group">
                        <input
                            type="text"
                            placeholder="Nome do produto"
                            value={novoItem.produto}
                            onChange={(e) => handleItemChange("produto", e.target.value)}
                            
                        />
                        <input
                            type="number"
                            placeholder="Quantidade"
                            value={novoItem.quantidade}
                            onChange={(e) => handleItemChange("quantidade", parseInt(e.target.value))}
                            
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Preço unitário"
                            value={novoItem.preco}
                            onChange={(e) => handleItemChange("preco", parseFloat(e.target.value))}
                            
                        />
                        <button type="button" className="btn-add" onClick={adicionarItem}>
                            Adicionar Item
                        </button>
                    </div>

                    <button type="submit" className="btn-submit">
                        Criar Pedido
                    </button>
                </form>

                {mensagem && <p className="mensagem">{mensagem}</p>}
            </div>

            {/* Listar Pedidos */}
            <div className="bloco amarelo">
                <h2>Listar Pedidos</h2>
                <button className="btn-atualizar" onClick={fetchPedidos} disabled={loading}>
                        🔄
                </button>
                {pedidos.length === 0 ? <p>Nenhum pedido encontrado.</p> : (
                    <ul className="lista-pedidos">
                        {pedidos.map((pedido) => (
                            <li key={pedido.id} className="pedido-item">
                                <span>{pedido.cliente} - R$ {pedido.total.toFixed(2)}</span>
                                <div className="acoes">
                                    <button className="deletar" onClick={() => handleDeletePedido(pedido.id)}>🗑️</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Pedidos;
