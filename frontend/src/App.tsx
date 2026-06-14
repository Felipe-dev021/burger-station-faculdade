import { useEffect, useMemo, useState } from 'react';

type ItemCardapio = {
  id: number;
  nome: string;
  preco: number;
};

type ItemComanda = ItemCardapio & {
  quantidade: number;
};

type MetodoPagamento = 'pix' | 'cartao';

type ItemHistorico = {
  idLocal: string;
  idPedido: number;
  criadoEm: string;
  formaPagamento: MetodoPagamento;
  subtotal: number;
  desconto: number;
  total: number;
  itens: ItemComanda[];
};

type PedidoCriado = {
  id: number;
  total: number;
};

const urlApiCardapio = 'https://burger-menu-api.onrender.com/cardapio';
const urlApiPedidos = 'https://burger-order-api.onrender.com/pedidos';
const chaveHistoricoPedidos = 'burger-station-historico-v1';

const formatadorMonetario = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const detalhesCardapio: Record<number, { icone: string; descricao: string }> = {
  1: { icone: '🍔', descricao: 'Blend especial 180g, queijo cheddar derretido e pão brioche selado.' },
  2: { icone: '🍟', descricao: 'Corte rústico, fritas duplas para máxima crocância por fora.' },
  3: { icone: '🥤', descricao: 'Refrigerante gelado com toque de limão e gelo filtrado.' },
  4: { icone: '🥗', descricao: 'Salada leve com folhas frescas, croutons e molho da casa.' },
  5: { icone: '🌯', descricao: 'Wrap dourado com recheio cremoso e tempero equilibrado.' },
  6: { icone: '🍰', descricao: 'Sobremesa delicada para fechar o pedido com estilo.' },
};

function formatarValor(valor: number): string {
  return formatadorMonetario.format(valor);
}

function formatarData(valor: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor));
}

function lerHistorico(): ItemHistorico[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const historicoBruto = window.localStorage.getItem(chaveHistoricoPedidos);

    if (!historicoBruto) {
      return [];
    }

    const historicoParseado = JSON.parse(historicoBruto) as ItemHistorico[];
    return Array.isArray(historicoParseado) ? historicoParseado : [];
  } catch {
    return [];
  }
}

function salvarHistorico(historico: ItemHistorico[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(chaveHistoricoPedidos, JSON.stringify(historico));
}

function clonarComanda(itens: ItemComanda[]): ItemComanda[] {
  return itens.map((item) => ({ ...item }));
}

export default function App() {
  const [itensCardapio, setItensCardapio] = useState<ItemCardapio[]>([]);
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>('pix');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [historicoPedidos, setHistoricoPedidos] = useState<ItemHistorico[]>(lerHistorico());
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoParaRepetir, setPedidoParaRepetir] = useState<ItemHistorico | null>(null);
  const [estaProcessando, setEstaProcessando] = useState(false);
  const [mensagemCheckout, setMensagemCheckout] = useState('');
  const [mensagemFeedback, setMensagemFeedback] = useState('');
  const [tomFeedback, setTomFeedback] = useState<'sucesso' | 'erro' | 'info'>('info');

  useEffect(() => {
    void carregarCardapio();
  }, []);

  useEffect(() => {
    salvarHistorico(historicoPedidos);
  }, [historicoPedidos]);

  const itensFiltrados = useMemo(() => {
    const termo = termoPesquisa.trim().toLowerCase();

    if (!termo) {
      return itensCardapio;
    }

    return itensCardapio.filter((item) => item.nome.toLowerCase().includes(termo));
  }, [itensCardapio, termoPesquisa]);

  const subtotal = comanda.reduce((acumulado, item) => acumulado + item.preco * item.quantidade, 0);
  const taxaDesconto = metodoPagamento === 'pix' ? 0.1 : 0;
  const desconto = subtotal * taxaDesconto;
  const total = subtotal - desconto;
  const rotuloPagamentoSelecionado = metodoPagamento === 'pix' ? 'PIX' : 'Cartão';

  async function carregarCardapio() {
    try {
      const resposta = await fetch(urlApiCardapio);

      if (!resposta.ok) {
        throw new Error('Falha ao carregar o cardápio.');
      }

      const cardapio = (await resposta.json()) as ItemCardapio[];
      setItensCardapio(cardapio);
    } catch (erro) {
      mostrarFeedback('Não foi possível carregar o cardápio agora.', 'erro');
    }
  }

  function mostrarFeedback(mensagem: string, tom: 'sucesso' | 'erro' | 'info') {
    setMensagemFeedback(mensagem);
    setTomFeedback(tom);
    setTimeout(() => setMensagemFeedback(''), 4000);
  }

  function adicionarAoCarrinho(item: ItemCardapio) {
    setComanda((comandaAtual) => {
      const itemExistente = comandaAtual.find((itemComanda) => itemComanda.id === item.id);

      if (itemExistente) {
        return comandaAtual.map((itemComanda) =>
          itemComanda.id === item.id ? { ...itemComanda, quantidade: itemComanda.quantidade + 1 } : itemComanda,
        );
      }

      return [...comandaAtual, { ...item, quantidade: 1 }];
    });

    mostrarFeedback(`${item.nome} adicionado à comanda.`, 'sucesso');
  }

  function atualizarQuantidade(itemId: number, delta: number) {
    setComanda((comandaAtual) =>
      comandaAtual
        .map((item) => (item.id === itemId ? { ...item, quantidade: item.quantidade + delta } : item))
        .filter((item) => item.quantidade > 0),
    );
  }

  function limparComanda() {
    setComanda([]);
    mostrarFeedback('Sua comanda foi limpa.', 'info');
  }

  function limparHistorico() {
    setHistoricoPedidos([]);
    mostrarFeedback('Histórico de pedidos limpo.', 'info');
  }

  function abrirConfirmacaoRepeticao(itemHistorico: ItemHistorico) {
    setPedidoParaRepetir(itemHistorico);
  }

  function confirmarRepeticao() {
    if (!pedidoParaRepetir) {
      return;
    }

    setComanda(clonarComanda(pedidoParaRepetir.itens));
    setMetodoPagamento(pedidoParaRepetir.formaPagamento);
    setPedidoParaRepetir(null);
    mostrarFeedback(`Itens do pedido #${pedidoParaRepetir.idPedido} adicionados à comanda.`, 'sucesso');
  }

  function abrirCheckout() {
    if (comanda.length === 0) {
      mostrarFeedback('Adicione pratos à comanda para continuar.', 'erro');
      return;
    }

    setMensagemCheckout('');
    setCheckoutAberto(true);
  }

  async function confirmarPedido() {
    if (comanda.length === 0) {
      return;
    }

    setEstaProcessando(true);

    try {
      const resposta = await fetch(urlApiPedidos, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total }),
      });

      if (!resposta.ok) {
        throw new Error('Falha no pedido');
      }

      const pedidoCriado = (await resposta.json()) as PedidoCriado;
      const novoItemHistorico: ItemHistorico = {
        idLocal: `${pedidoCriado.id}-${Date.now()}`,
        idPedido: pedidoCriado.id,
        criadoEm: new Date().toISOString(),
        formaPagamento: metodoPagamento,
        subtotal,
        desconto,
        total,
        itens: clonarComanda(comanda),
      };

      setHistoricoPedidos((historicoAtual) => [novoItemHistorico, ...historicoAtual].slice(0, 8));
      mostrarFeedback(`Pedido #${pedidoCriado.id} processado com sucesso.`, 'sucesso');
      setMensagemCheckout('O seu pedido foi enviado para a cozinha!');

      setTimeout(() => {
        setCheckoutAberto(false);
        setComanda([]);
        setEstaProcessando(false);
        void carregarCardapio();
      }, 2500);
    } catch (erro) {
      setMensagemCheckout('Não foi possível processar o pedido no momento.');
      setEstaProcessando(false);
      mostrarFeedback('Não foi possível concluir o pedido agora.', 'erro');
    }
  }

  return (
    <main className="container-restaurante">
      <header className="cabecalho-restaurante">
        <div className="conteudo-cabecalho">
          <span className="subtitulo-restaurante">Cozinha Artesanal</span>
          <h1>Burger Station</h1>
          <p className="descricao-restaurante">Sabores autênticos preparados com ingredientes selecionados.</p>
        </div>
      </header>

      {mensagemFeedback ? <div className={`banner-status banner-status--${tomFeedback}`}>{mensagemFeedback}</div> : null}

      <section className="area-trabalho-cardapio">
        <article className="secao-cardapio">
          <div className="titulo-secao">
            <h2>Menu Principal</h2>
            <div className="divisor-titulo"></div>
          </div>

          <div className="ferramentas-cardapio">
            <input
              className="pesquisa-cardapio"
              type="search"
              placeholder="Pesquisar especialidades..."
              value={termoPesquisa}
              onChange={(event) => setTermoPesquisa(event.target.value)}
            />
          </div>

          <div className="lista-cardapio">
            {itensFiltrados.length === 0 ? (
              <div className="estado-vazio">
                <span className="icone-vazio">🍽️</span>
                <p>Nenhum prato encontrado com este nome.</p>
              </div>
            ) : (
              itensFiltrados.map((item) => {
                const detalhes = detalhesCardapio[item.id] ?? {
                  icone: '✨',
                  descricao: 'Prato especial do chef, preparado na hora.',
                };

                return (
                  <div className="cartao-prato" key={item.id}>
                    <div className="icone-prato">{detalhes.icone}</div>
                    <div className="info-prato">
                      <div className="cabecalho-prato">
                        <h3>{item.nome}</h3>
                        <span className="preco-prato">{formatarValor(item.preco)}</span>
                      </div>
                      <p className="descricao-prato">{detalhes.descricao}</p>
                      <button className="btn-adicionar" onClick={() => adicionarAoCarrinho(item)}>
                        Adicionar à Comanda
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <aside className="barra-lateral-pedido">
          <div className="comanda-pedido">
            <h2 className="titulo-comanda">Sua Comanda</h2>

            <div className="itens-comanda">
              {comanda.length === 0 ? (
                <div className="comanda-vazia">
                  <p>Sua comanda está vazia.</p>
                  <span>Selecione pratos do menu ao lado.</span>
                </div>
              ) : (
                comanda.map((item) => (
                  <div className="item-comanda" key={item.id}>
                    <div className="detalhes-item-comanda">
                      <strong>
                        {item.quantidade}x {item.nome}
                      </strong>
                      <span>{formatarValor(item.preco * item.quantidade)}</span>
                    </div>
                    <div className="acoes-item-comanda">
                      <button onClick={() => atualizarQuantidade(item.id, -1)}>−</button>
                      <button onClick={() => atualizarQuantidade(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {comanda.length > 0 ? (
              <div className="checkout-comanda">
                <div className="opcoes-pagamento">
                  <p>Forma de Pagamento</p>
                  <div className="botoes-pagamento">
                    <button
                      className={metodoPagamento === 'pix' ? 'ativo' : ''}
                      onClick={() => setMetodoPagamento('pix')}
                    >
                      PIX (10% OFF)
                    </button>
                    <button
                      className={metodoPagamento === 'cartao' ? 'ativo' : ''}
                      onClick={() => setMetodoPagamento('cartao')}
                    >
                      Cartão
                    </button>
                  </div>
                </div>

                <div className="resumo-comanda">
                  <div className="linha-resumo">
                    <span>Subtotal</span>
                    <span>{formatarValor(subtotal)}</span>
                  </div>
                  {desconto > 0 ? (
                    <div className="linha-resumo destaque">
                      <span>Desconto PIX</span>
                      <span>- {formatarValor(desconto)}</span>
                    </div>
                  ) : null}
                  <div className="linha-resumo total">
                    <span>Total</span>
                    <span>{formatarValor(total)}</span>
                  </div>
                </div>

                <button className="btn-finalizar" onClick={abrirCheckout}>
                  Fechar Conta
                </button>
                <button className="btn-limpar-comanda" onClick={limparComanda}>
                  Limpar Comanda
                </button>
              </div>
            ) : null}
          </div>

          <div className="painel-historico">
            <div className="cabecalho-historico">
              <h3>Últimos Pedidos</h3>
              {historicoPedidos.length > 0 ? <button className="btn-link" onClick={limparHistorico}>Limpar</button> : null}
            </div>

            <div className="lista-historico">
              {historicoPedidos.length === 0 ? (
                <p className="historico-vazio">Nenhum histórico registrado.</p>
              ) : (
                historicoPedidos.map((itemHistorico) => (
                  <div className="cartao-historico" key={itemHistorico.idLocal}>
                    <div className="topo-cartao-historico">
                      <div>
                        <strong>Pedido #{itemHistorico.idPedido}</strong>
                        <span>{formatarData(itemHistorico.criadoEm)}</span>
                      </div>
                      <button className="btn-repetir" onClick={() => abrirConfirmacaoRepeticao(itemHistorico)}>
                        Repetir
                      </button>
                    </div>
                    <div className="base-cartao-historico">
                      <span>
                        {itemHistorico.itens.length} itens ({itemHistorico.formaPagamento === 'pix' ? 'PIX' : 'Cartão'})
                      </span>
                      <strong>{formatarValor(itemHistorico.total)}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>

      {checkoutAberto ? (
        <div className="sobreposicao-recibo">
          <div className="modal-recibo">
            <div className="cabecalho-recibo">
              <h2>Burger Station</h2>
              <p>Confirmação do Pedido</p>
              {estaProcessando ? null : <button className="btn-fechar" onClick={() => setCheckoutAberto(false)}>×</button>}
            </div>

            <div className="corpo-recibo">
              {mensagemCheckout ? (
                <div className="sucesso-recibo">
                  <span className="icone-sucesso">
                    {mensagemCheckout.includes('Não foi possível') ? '!' : '✓'}
                  </span>
                  <h3>{mensagemCheckout}</h3>
                </div>
              ) : (
                <>
                  <div className="itens-recibo">
                    {comanda.map((item) => (
                      <div className="linha-recibo" key={item.id}>
                        <span>
                          {item.quantidade}x {item.nome}
                        </span>
                        <span>{formatarValor(item.preco * item.quantidade)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="totais-recibo">
                    <div className="linha-recibo">
                      <span>Subtotal</span>
                      <span>{formatarValor(subtotal)}</span>
                    </div>
                    {desconto > 0 ? (
                      <div className="linha-recibo linha-desconto">
                        <span>Desconto (Strategy {rotuloPagamentoSelecionado})</span>
                        <span>- {formatarValor(desconto)}</span>
                      </div>
                    ) : null}
                    <div className="linha-recibo total-final">
                      <span>Total a Pagar</span>
                      <span>{formatarValor(total)}</span>
                    </div>
                  </div>

                  <div className="acoes-recibo">
                    <button className="btn-cancelar" onClick={() => setCheckoutAberto(false)} disabled={estaProcessando}>
                      Voltar
                    </button>
                    <button className="btn-confirmar" onClick={confirmarPedido} disabled={estaProcessando}>
                      {estaProcessando ? 'Enviando...' : 'Confirmar Pedido'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {pedidoParaRepetir ? (
        <div className="sobreposicao-recibo">
          <div className="modal-recibo">
            <div className="cabecalho-recibo">
              <h2>Repetir Pedido</h2>
              <p>Deseja recarregar estes itens?</p>
            </div>

            <div className="corpo-recibo">
              <div className="itens-recibo">
                {pedidoParaRepetir.itens.map((item) => (
                  <div className="linha-recibo" key={item.id}>
                    <span>
                      {item.quantidade}x {item.nome}
                    </span>
                    <span>{formatarValor(item.preco * item.quantidade)}</span>
                  </div>
                ))}
              </div>
              <div className="totais-recibo">
                <div className="linha-recibo">
                  <span>Pagamento Original</span>
                  <span>{pedidoParaRepetir.formaPagamento === 'pix' ? 'PIX' : 'Cartão'}</span>
                </div>
                <div className="linha-recibo total-final">
                  <span>Total Histórico</span>
                  <span>{formatarValor(pedidoParaRepetir.total)}</span>
                </div>
              </div>

              <div className="acoes-recibo">
                <button className="btn-cancelar" onClick={() => setPedidoParaRepetir(null)}>Cancelar</button>
                <button className="btn-confirmar" onClick={confirmarRepeticao}>Adicionar à Comanda</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}