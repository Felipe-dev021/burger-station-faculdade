import React, { useState, useEffect } from 'react';

// Configurações de conexão com as APIs do Render
const URL_MENU = 'https://burger-menu-api.onrender.com';
const URL_ORDERS = 'https://burger-order-api.onrender.com';

interface ItemCardapio {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
}

interface Pedido {
  id: number;
  total: number;
  mesa: number;
  status: 'PENDENTE' | 'COZINHA' | 'PRONTO' | 'ENTREGUE';
  itens: string;
}

export default function App() {
  // Controle de Abas: 'cliente' ou 'admin'
  const [aba, setAba] = useState<'cliente' | 'admin'>('cliente');
  const [mesa] = useState<number>(() => Math.floor(Math.random() * 10) + 1); // Simula leitura do QR Code da mesa

  // Estados dos dados
  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carrinho, setCarrinho] = useState<{ [key: number]: number }>({});

  // Mock inicial caso o banco de dados do Neon esteja vazio no primeiro acesso
  useEffect(() => {
    // Simulando itens padrão se a API demorar ou estiver vazia
    setCardapio([
      { id: 1, nome: '🍔 Burger Estelar', preco: 29.9, categoria: 'Lanches', estoque: 15 },
      { id: 2, nome: '🍟 Batata Cósmica', preco: 14.9, categoria: 'Acompanhamentos', estoque: 20 },
      { id: 3, nome: '🥤 Refrigerante de Marte', preco: 7.0, categoria: 'Bebidas', estoque: 8 },
    ]);
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const res = await fetch(`${URL_ORDERS}/pedidos`);
      const dados = await res.json();
      if (Array.isArray(dados)) setPedidos(dados);
    } catch (e) {
      console.log("Erro ao buscar pedidos do backend:", e);
    }
  };

  // Funções do Cliente
  const adicionarAoCarrinho = (id: number) => {
    const item = cardapio.find(c => c.id === id);
    if (item && item.estoque > (carrinho[id] || 0)) {
      setCarrinho(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    } else {
      alert("Desculpe, este item atingiu o limite do estoque da cozinha!");
    }
  };

  const calcularTotal = () => {
    return Object.entries(carrinho).reduce((sum, [id, qtd]) => {
      const item = cardapio.find(c => c.id === Number(id));
      return sum + (item ? item.preco * qtd : 0);
    }, 0);
  };

  const enviarPedidoParaCozinha = async () => {
    const total = calcularTotal();
    if (total === 0) return alert("Seu carrinho está vazio!");

    const listaItensTexto = Object.entries(carrinho)
      .map(([id, qtd]) => {
        const item = cardapio.find(c => c.id === Number(id));
        return `${qtd}x ${item?.nome}`;
      })
      .join(', ');

    const payload = { total, mesa, itens: listaItensTexto };

    try {
      await fetch(`${URL_ORDERS}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Abate temporário do estoque visualmente
      setCardapio(prev => prev.map(item => ({
        ...item,
        estoque: item.estoque - (carrinho[item.id] || 0)
      })));

      setCarrinho({});
      alert(`🚀 Sucesso! Pedido enviado para a Cozinha. Mesa: ${mesa}`);
      carregarPedidos();
    } catch (e) {
      alert("Erro ao enviar pedido para a nuvem.");
    }
  };

  // Funções do Admin
  const atualizarStatusPedido = async (id: number, novoStatus: string) => {
    try {
      await fetch(`${URL_ORDERS}/pedidos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
      carregarPedidos();
    } catch (e) {
      alert("Erro ao atualizar status");
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      {/* Menu Superior de Alternância */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#38bdf8' }}>🌌 Burger Station</h1>
          <small style={{ color: '#94a3b8' }}>Mesa Atual (QR Code): {mesa}</small>
        </div>
        <div>
          <button 
            onClick={() => setAba('cliente')} 
            style={{ padding: '10px 20px', marginRight: '10px', borderRadius: '5px', border: 'none', backgroundColor: aba === 'cliente' ? '#38bdf8' : '#334155', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            🛒 Ver Cardápio (Mesa)
          </button>
          <button 
            onClick={() => { setAba('admin'); carregarPedidos(); }} 
            style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: aba === 'admin' ? '#f43f5e' : '#334155', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            👨‍🍳 Painel Admin / Cozinha
          </button>
        </div>
      </div>

      {/* VISÃO DO CLIENTE (CARDÁPIO) */}
      {aba === 'cliente' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div>
            <h3>Selecione seus lanches:</h3>
            {cardapio.map(item => (
              <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '18px' }}>{item.nome}</strong>
                  <div style={{ color: '#38bdf8', marginTop: '5px' }}>R$ {item.preco.toFixed(2)}</div>
                  <small style={{ color: item.estoque > 3 ? '#4ade80' : '#f87171' }}>Estoque disponível: {item.estoque} un</small>
                </div>
                <button 
                  onClick={() => adicionarAoCarrinho(item.id)}
                  disabled={item.estoque === 0}
                  style={{ padding: '10px 15px', backgroundColor: '#38bdf8', border: 'none', color: '#0f172a', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {item.estoque === 0 ? 'Esgotado' : 'Adicionar +'}
                </button>
              </div>
            ))}
          </div>

          {/* Carrinho na Mesa */}
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
            <h3>🛒 Sua Comanda (Mesa {mesa})</h3>
            {Object.keys(carrinho).length === 0 ? (
              <p style={{ color: '#64748b' }}>Seu carrinho está vazio.</p>
            ) : (
              Object.entries(carrinho).map(([id, qtd]) => {
                const item = cardapio.find(c => c.id === Number(id));
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>
                    <span>{qtd}x {item?.nome}</span>
                    <span>R$ {((item?.preco || 0) * qtd).toFixed(2)}</span>
                  </div>
                );
              })
            )}
            <h4 style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total:</span>
              <span style={{ color: '#4ade80' }}>R$ {calcularTotal().toFixed(2)}</span>
            </h4>
            <button 
              onClick={enviarPedidoParaCozinha}
              style={{ width: '100%', padding: '12px', backgroundColor: '#4ade80', color: '#0f172a', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
              🔔 Enviar Pedido para Cozinha
            </button>
          </div>
        </div>
      )}

      {/* VISÃO DO ADMINISTRADOR (GESTÃO E COZINHA) */}
      {aba === 'admin' && (
        <div>
          <h2>👨‍🍳 Monitor de Pedidos da Cozinha (Tempo Real)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Coluna de Pedidos Ativos */}
            <div>
              <h3>Pedidos em Andamento</h3>
              {pedidos.length === 0 ? (
                <p style={{ color: '#64748b' }}>Nenhum pedido recebido pelas mesas ainda.</p>
              ) : (
                pedidos.map(p => (
                  <div key={p.id} style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: `5px solid ${p.status === 'PENDENTE' ? '#ef4444' : p.status === 'COZINHA' ? '#eab308' : '#22c55e'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Mesa {p.mesa} <span style={{ color: '#94a3b8' }}>#{p.id.toString().slice(-4)}</span></strong>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#334155' }}>{p.status}</span>
                    </div>
                    <p style={{ margin: '10px 0', color: '#cbd5e1' }}>{p.itens}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }}>R$ {p.total.toFixed(2)}</span>
                      <div>
                        {p.status === 'PENDENTE' && (
                          <button onClick={() => atualizarStatusPedido(p.id, 'COZINHA')} style={{ padding: '5px 10px', backgroundColor: '#eab308', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Começar a Preparar</button>
                        )}
                        {p.status === 'COZINHA' && (
                          <button onClick={() => atualizarStatusPedido(p.id, 'PRONTO')} style={{ padding: '5px 10px', backgroundColor: '#22c55e', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Pronto para Servir</button>
                        )}
                        {p.status === 'PRONTO' && (
                          <button onClick={() => atualizarStatusPedido(p.id, 'ENTREGUE')} style={{ padding: '5px 10px', backgroundColor: '#64748b', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Finalizar/Entregar</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Painel de Controle de Estoque */}
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
              <h3>📦 Controle de Estoque de Insumos</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8' }}>
                    <th style={{ paddingBottom: '10px' }}>Item</th>
                    <th style={{ paddingBottom: '10px' }}>Qtd Atual</th>
                    <th style={{ paddingBottom: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cardapio.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '10px 0' }}>{item.nome}</td>
                      <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{item.estoque} un</td>
                      <td style={{ padding: '10px 0' }}>
                        <span style={{ color: item.estoque > 5 ? '#22c55e' : item.estoque > 0 ? '#eab308' : '#ef4444', fontWeight: 'bold' }}>
                          {item.estoque > 5 ? '● Seguro' : item.estoque > 0 ? '● Baixo' : '❌ Crítico'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setCardapio(prev => prev.map(i => ({ ...i, estoque: 20 })))} style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#334155', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>
                🔄 Abastecer Todo o Estoque (Fornecedor)
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}