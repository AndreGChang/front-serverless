export interface ItemPedido {
    id: string;
    produto: string;
    quantidade: number;
    preco: number;
}

export interface Pedido {
    id: string;
    cliente: string;
    email: string;
    itens: ItemPedido[];
    total: number;
    status: string;
    data_criacao?: string;
}
