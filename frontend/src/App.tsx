import React, { useState, useEffect } from 'react';
import './styles.css'; 

const URL_MENU = 'https://burger-menu-api.onrender.com';
const URL_ORDERS = 'https://burger-order-api.onrender.com';

interface ItemCardapio { id: number; nome: string; preco: number; categoria: string; estoque: number; }
interface Pedido { id: number; total: number; mesa: number; status: 'PENDENTE' | 'COZINHA' | 'PRONTO' | 'ENTREGUE'; itens: string; }

export default function App() {
  const [aba, setAba] = useState<'cliente' | 'admin'>('cliente');
  const [autenticado, setAutenticado] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [mesa] = useState<number>(() => Math.floor(Math.random() * 15) + 1);

  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carrinho, setCarrinho] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const carregarMenu = async () => {
      try {
        const res = await fetch(`${URL_MENU}/cardapio`);
        const dados = await res.json();
        if (Array.isArray(dados) && dados.length > 0) {
          setCardapio(dados);
        } else {
          gerarItensMock();
        }
      } catch (e) {
        gerarItensMock();
      }
    };

    const gerarItensMock = () => {
      setCardapio([
        { id: 1, nome: 'Gourmet House Burger', preco: 34.90, categoria: 'Lanches', estoque: 15 },
        { id: 2, nome: 'Batata Rústica com Alecrim', preco: 18.90, categoria: 'Acompanhamentos', estoque: 20 },
        { id: 3, nome: 'Suco Natural de Frutas', preco: 9.50, categoria: 'Bebidas', estoque: 8 },
      ]);
    };

    carregarMenu();
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const res = await fetch(`${URL_ORDERS}/pedidos`);
      const dados = await res.json();
      if (Array.isArray(dados)) setPedidos(dados);
    } catch (e) { console.log(e); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === 'admin' && loginForm.pass === 'admin123') {
      setAutenticado(true);
    } else { alert("Credenciais Inválidas!"); }
  };

  const adicionarAoCarrinho = (id: number) => {
    const item = cardapio.find(c => c.id === id);
    if (item && item.estoque > (carrinho[id] || 0)) {
      setCarrinho(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    }
  };

  const calcularTotal = () => Object.entries(carrinho).reduce((sum, [id, qtd]) => {
    const item = cardapio.find(c => c.id === Number(id));
    return sum + (item ? item.preco * qtd : 0);
  }, 0);

  const enviarPedido = async () => {
    const total = calcularTotal();
    if (total === 0) return;
    const itensTexto = Object.entries(carrinho).map(([id, qtd]) => `${qtd}x ${cardapio.find(c => c.id === Number(id))?.nome}`).join(', ');

    await fetch(`${URL_ORDERS}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total, mesa, itens: itensTexto }),
    });

    setCardapio(prev => prev.map(item => ({ ...item, estoque: item.estoque - (carrinho[item.id] || 0) })));
    setCarrinho({});
    alert("Pedido enviado com sucesso para a cozinha!");
    carregarPedidos();
  };

  const mudarStatus = async (id: number, status: string) => {
    await fetch(`${URL_ORDERS}/pedidos/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    carregarPedidos();
  };

  return (
    <>
      <nav className="navbar">
        <h1>Bistro<span className="text-gold">Station</span></h1>
        <div>
          <button className={`btn btn-nav ${aba === 'cliente' ? 'active' : ''}`} onClick={() => setAba('cliente')}>Cardápio</button>
          <button className="btn btn-secondary" onClick={() => setAba('admin')}>Painel Admin</button>
        </div>
      </nav>

      <div className="container">
        {aba === 'cliente' && (
          <div className="grid-menu">
            <section>
              <h2 className="section-title">Mesa <span className="text-gold">{mesa}</span> — Seleção de Pratos</h2>
              {cardapio.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <h3>{item.nome}</h3>
                    <p className="text-gold">R$ {item.preco.toFixed(2)}</p>
                    <small>Disponível: {item.estoque} un</small>
                  </div>
                  <button className="btn btn-primary" onClick={() => adicionarAoCarrinho(item.id)} disabled={item.estoque === 0}>
                    {item.estoque === 0 ? 'ESGOTADO' : 'ADICIONAR'}
                  </button>
                </div>
              ))}
            </section>

            <aside className="comanda-box">
              <h3 className="comanda-title">🛒 Sua Comanda</h3>
              {Object.keys(carrinho).length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', margin: '20px 0' }}>Selecione os produtos desejados.</p>
              ) : (
                Object.keys(carrinho).map(id => {
                  const item = cardapio.find(c => c.id === Number(id));
                  return (
                    <div key={id} className="comanda-item">
                      <span><strong>{carrinho[Number(id)]}x</strong> {item?.nome}</span>
                      <span>R$ {((item?.preco || 0) * carrinho[Number(id)]).toFixed(2)}</span>
                    </div>
                  );
                })
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginTop: '30px' }}>
                <span>TOTAL:</span>
                <span className="text-gold">R$ {calcularTotal().toFixed(2)}</span>
              </div>
              <button className="btn btn-primary btn-action" onClick={enviarPedido} disabled={calcularTotal() === 0}>
                CONFIRMAR PEDIDO
              </button>
            </aside>
          </div>
        )}

        {aba === 'admin' && (
          !autenticado ? (
            <div className="login-box">
              <h2>Acesso Restrito</h2>
              <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>Gestão Interna da Cozinha</p>
              <form onSubmit={handleLogin}>
                <input type="text" placeholder="Usuário" className="input-field" onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
                <input type="password" placeholder="Senha" className="input-field" onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ENTRAR</button>
              </form>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2>Esteira de Produção</h2>
                <button className="btn btn-secondary" onClick={() => setAutenticado(false)}>Sair do Painel</button>
              </div>

              <div className="kanban-board">
                <div className="kanban-column">
                  <h3 className="kanban-column-title">📥 Recebidos ({pedidos.filter(p => p.status === 'PENDENTE').length})</h3>
                  {pedidos.filter(p => p.status === 'PENDENTE').map(p => (
                    <div key={p.id} className="pedido-ticket">
                      <div className="pedido-header"><span>Mesa {p.mesa}</span><span className="text-gold">#{p.id.toString().slice(-3)}</span></div>
                      <p style={{fontSize: '14px', color: '#d1d5db'}}>{p.itens}</p>
                      <button className="btn btn-secondary btn-action" onClick={() => mudarStatus(p.id, 'COZINHA')}>Preparar</button>
                    </div>
                  ))}
                </div>

                <div className="kanban-column" style={{ borderColor: '#f59e0b' }}>
                  <h3 className="kanban-column-title" style={{ color: '#f59e0b' }}>👨‍🍳 Na Cozinha ({pedidos.filter(p => p.status === 'COZINHA').length})</h3>
                  {pedidos.filter(p => p.status === 'COZINHA').map(p => (
                    <div key={p.id} className="pedido-ticket" style={{ borderColor: '#f59e0b' }}>
                      <div className="pedido-header"><span>Mesa {p.mesa}</span><span className="text-gold">#{p.id.toString().slice(-3)}</span></div>
                      <p style={{fontSize: '14px', color: '#d1d5db'}}>{p.itens}</p>
                      <button className="btn btn-primary btn-action" onClick={() => mudarStatus(p.id, 'PRONTO')}>Marcar como Pronto</button>
                    </div>
                  ))}
                </div>

                <div className="kanban-column" style={{ borderColor: '#10b981' }}>
                  <h3 className="kanban-column-title" style={{ color: '#10b981' }}>✅ Prontos ({pedidos.filter(p => p.status === 'PRONTO').length})</h3>
                  {pedidos.filter(p => p.status === 'PRONTO').map(p => (
                    <div key={p.id} className="pedido-ticket" style={{ borderColor: '#10b981' }}>
                      <div className="pedido-header"><span>Mesa {p.mesa}</span><span className="text-gold">#{p.id.toString().slice(-3)}</span></div>
                      <p style={{fontSize: '14px', color: '#d1d5db'}}>{p.itens}</p>
                      <button className="btn btn-secondary btn-action" style={{borderColor: '#10b981', color: '#10b981'}} onClick={() => mudarStatus(p.id, 'ENTREGUE')}>Despachar à Mesa</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}