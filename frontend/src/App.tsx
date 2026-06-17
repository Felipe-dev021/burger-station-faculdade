import React, { useState, useEffect } from 'react';
import './styles.css'; 

const env = (import.meta as any).env;
const URL_MENU = env?.VITE_MENU_URL || 'https://burger-menu-api.onrender.com';
const URL_ORDERS = env?.VITE_ORDER_URL || 'https://burger-order-api.onrender.com';

interface ItemCardapio { id: number; nome: string; preco: number; categoria: string; estoque: number; }
interface Pedido { id: number; total: number; mesa: number; status: 'PENDENTE' | 'COZINHA' | 'PRONTO' | 'ENTREGUE'; itens: string; }

export default function App() {
  const [aba, setAba] = useState<'cliente' | 'admin'>('cliente');
  const [autenticado, setAutenticado] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [mesa] = useState<number>(() => Math.floor(Math.random() * 15) + 1);
  const [tipoPagamento, setTipoPagamento] = useState<'PIX' | 'CARTAO'>('PIX');

  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carrinho, setCarrinho] = useState<{ [key: number]: number }>({});

  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    const fetchWithRetry = async (url: string, retries = 3, delay = 3000): Promise<any> => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (e) {
        if (retries > 0) {
          setIsWakingUp(true);
          console.log(`Tentando reconectar a ${url}... (${retries} tentativas restantes)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, retries - 1, delay);
        }
        throw e;
      }
    };

    const carregarMenu = async () => {
      setLoading(true);
      try {
        const dados = await fetchWithRetry(`${URL_MENU}/cardapio`, 5, 5000);
        if (Array.isArray(dados) && dados.length > 0) {
          setCardapio(dados);
        } else {
          gerarItensMock();
        }
      } catch (e) {
        console.error("Erro ao carregar menu, usando dados locais.", e);
        gerarItensMock();
      } finally {
        setIsWakingUp(false);
        setTimeout(() => setLoading(false), 800);
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

  const calcularSubtotal = () => Object.entries(carrinho).reduce((sum, [id, qtd]) => {
    const item = cardapio.find(c => c.id === Number(id));
    return sum + (item ? item.preco * qtd : 0);
  }, 0);

  const calcularTotalComDesconto = () => {
    const subtotal = calcularSubtotal();
    if (tipoPagamento === 'PIX') return subtotal * 0.9;
    return subtotal + 5;
  };

  const enviarPedido = async () => {
    const total = calcularSubtotal();
    if (total === 0) return;
    const itensTexto = Object.entries(carrinho).map(([id, qtd]) => `${qtd}x ${cardapio.find(c => c.id === Number(id))?.nome}`).join(', ');

    const res = await fetch(`${URL_ORDERS}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total, mesa, itens: itensTexto, tipoPagamento }),
    });
    const pedidoCriado = await res.json();

    setCardapio(prev => prev.map(item => ({ ...item, estoque: item.estoque - (carrinho[item.id] || 0) })));
    setCarrinho({});
    alert(`Pedido enviado! Total com desconto/taxa: R$ ${pedidoCriado.total.toFixed(2)}`);
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
        <div className="nav-actions">
          <button className={`btn btn-nav ${aba === 'cliente' ? 'active' : ''}`} onClick={() => setAba('cliente')}>Cardápio</button>
          <button className="btn btn-secondary" onClick={() => setAba('admin')}>Painel Admin</button>
        </div>
      </nav>

      <div className="container">
        {aba === 'cliente' && (
          <div className="grid-menu">
            <section>
              <h2 className="section-title">Mesa <span className="text-gold">{mesa}</span> — Seleção de Pratos</h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <div className="loading-spinner" style={{ marginBottom: '15px', fontSize: '24px', animation: 'spin 2s linear infinite' }}>⏳</div>
                  <p>{isWakingUp ? 'Acordando servidores (Render)...' : 'Carregando cardápio gourmet...'}</p>
                  {isWakingUp && <small style={{ display: 'block', marginTop: '10px', color: '#6b7280' }}>Isso pode levar até 30 segundos se os serviços estiverem hibernando.</small>}
                </div>
              ) : (
                cardapio.map(item => (
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
                ))
              )}
            </section>

            <aside className="comanda-box">
              <h3 className="comanda-title">🛒 Sua Comanda</h3>
              {Object.keys(carrinho).length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', margin: '20px 0' }}>Selecione os produtos desejados.</p>
              ) : (
                <>
                  {Object.keys(carrinho).map(id => {
                    const item = cardapio.find(c => c.id === Number(id));
                    return (
                      <div key={id} className="comanda-item">
                        <span><strong>{carrinho[Number(id)]}x</strong> {item?.nome}</span>
                        <span>R$ {((item?.preco || 0) * carrinho[Number(id)]).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  
                  <div className="pagamento-selector">
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Forma de Pagamento:</p>
                    <div className="pagamento-options">
                      <button 
                        className={`btn ${tipoPagamento === 'PIX' ? 'btn-primary' : 'btn-secondary'}`} 
                        onClick={() => setTipoPagamento('PIX')}
                        style={{ flex: 1, fontSize: '12px' }}
                      >
                        PIX (10% OFF)
                      </button>
                      <button 
                        className={`btn ${tipoPagamento === 'CARTAO' ? 'btn-primary' : 'btn-secondary'}`} 
                        onClick={() => setTipoPagamento('CARTAO')}
                        style={{ flex: 1, fontSize: '12px' }}
                      >
                        CARTÃO (+R$5)
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="resumo-box">
                <div className="resumo-linha">
                  <span>Subtotal:</span>
                  <span>R$ {calcularSubtotal().toFixed(2)}</span>
                </div>
                <div className="resumo-total">
                  <span>TOTAL FINAL:</span>
                  <span className="text-gold">R$ {calcularTotalComDesconto().toFixed(2)}</span>
                </div>
              </div>

              <button className="btn btn-primary btn-action" onClick={enviarPedido} disabled={calcularSubtotal() === 0}>
                CONFIRMAR PEDIDO
              </button>
            </aside>
          </div>
        )}

        {aba === 'admin' && (
          !autenticado ? (
            <div className="login-box">
              <h2>Acesso Restrito</h2>
              <p style={{ color: '#6b7280', marginBottom: '12px', fontSize: '14px' }}>Gestão Interna da Cozinha</p>
              
              <div style={{ background: '#1c2330', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '12px', border: '1px solid #fbbf24' }}>
                <p className="text-gold" style={{ fontWeight: 'bold', marginBottom: '4px' }}>Acesso para Avaliação:</p>
                <p>Usuário: <code style={{ color: '#fff' }}>admin</code></p>
                <p>Senha: <code style={{ color: '#fff' }}>admin123</code></p>
              </div>

              <form onSubmit={handleLogin}>
                <input type="text" placeholder="Usuário" className="input-field" onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
                <input type="password" placeholder="Senha" className="input-field" onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ENTRAR</button>
              </form>
            </div>
          ) : (
            <div>
              <div className="admin-header">
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
                      <div className="pedido-footer">
                        <span style={{ fontWeight: 'bold' }}>R$ {p.total.toFixed(2)}</span>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => mudarStatus(p.id, 'COZINHA')}>Preparar</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="kanban-column" style={{ borderColor: '#f59e0b' }}>
                  <h3 className="kanban-column-title" style={{ color: '#f59e0b' }}>👨‍🍳 Na Cozinha ({pedidos.filter(p => p.status === 'COZINHA').length})</h3>
                  {pedidos.filter(p => p.status === 'COZINHA').map(p => (
                    <div key={p.id} className="pedido-ticket" style={{ borderColor: '#f59e0b' }}>
                      <div className="pedido-header"><span>Mesa {p.mesa}</span><span className="text-gold">#{p.id.toString().slice(-3)}</span></div>
                      <p style={{fontSize: '14px', color: '#d1d5db'}}>{p.itens}</p>
                      <div className="pedido-footer">
                         <span style={{ fontWeight: 'bold' }}>R$ {p.total.toFixed(2)}</span>
                         <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => mudarStatus(p.id, 'PRONTO')}>Pronto</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="kanban-column" style={{ borderColor: '#10b981' }}>
                  <h3 className="kanban-column-title" style={{ color: '#10b981' }}>✅ Prontos ({pedidos.filter(p => p.status === 'PRONTO').length})</h3>
                  {pedidos.filter(p => p.status === 'PRONTO').map(p => (
                    <div key={p.id} className="pedido-ticket" style={{ borderColor: '#10b981' }}>
                      <div className="pedido-header"><span>Mesa {p.mesa}</span><span className="text-gold">#{p.id.toString().slice(-3)}</span></div>
                      <p style={{fontSize: '14px', color: '#d1d5db'}}>{p.itens}</p>
                      <div className="pedido-footer">
                        <span style={{ fontWeight: 'bold' }}>R$ {p.total.toFixed(2)}</span>
                        <button className="btn btn-secondary" style={{borderColor: '#10b981', color: '#10b981', padding: '5px 10px', fontSize: '12px'}} onClick={() => mudarStatus(p.id, 'ENTREGUE')}>Despachar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <footer className="footer">
        <p>Burger Station — Projeto de Arquitetura de Software</p>
        <div className="footer-links">
          <span>API Menu: <a href={URL_MENU} target="_blank" rel="noreferrer">{URL_MENU}</a></span>
          <span>API Pedidos: <a href={URL_ORDERS} target="_blank" rel="noreferrer">{URL_ORDERS}</a></span>
        </div>
      </footer>
    </>
  );
}
