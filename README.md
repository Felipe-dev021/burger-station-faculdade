# 🍔 Burger Station (OrderLite)
Plataforma de autoatendimento para lanchonetes onde clientes montam seus pedidos, visualizam o cardápio em tempo real e recebem descontos dinâmicos.

Projeto desenvolvido para demonstrar, de forma prática e justificada: Clean Code, SOLID, Design Patterns, TDD, BDD, Arquitetura Limpa, Microsserviços e Docker.

## 1. Problema e proposta de solução
**Problema:** Lanchonetes e bistrôs perdem tempo, dinheiro e organização anotando pedidos em comandas de papel, o que gera erros na cozinha, lentidão no fechamento das contas e dificuldade em gerenciar estoques de forma dinâmica.

**Solução:** O *Burger Station* é um sistema digital de autoatendimento. O cliente visualiza o cardápio e monta sua própria comanda, que calcula descontos dinâmicos (via Strategy) e envia o pedido diretamente para a cozinha. O sistema é resiliente: se o banco de pedidos cair, o catálogo de produtos (cardápio) continua funcionando.

## 2. Divisão em microsserviços
O backend é dividido em 2 microsserviços independentes (cada um com seu próprio código e banco), consumidos por 1 aplicação web que os integra de forma transparente:

| Microsserviço | Porta | Responsabilidade | Banco | Pasta |
| :--- | :--- | :--- | :--- | :--- |
| **order-service** | 3001 | Processamento, cálculo de descontos e pedidos | PostgreSQL | `order-service` |
| **menu-service** | 3002 | Gestão e listagem do catálogo de produtos | PostgreSQL | `menu-service` |
| **frontend** | 8080 | Interface única que consome os 2 serviços | — | `frontend` |

**Transparência para o usuário:** Quem usa o sistema acessa um único site (o frontend). Ele não percebe que existem serviços distintos — o React chama cada API nos bastidores. Se um serviço falhar, o outro permanece isolado e funcional.

### Arquitetura do Sistema
```
              ┌────────────┐
   Browser ──▶│  Frontend  │ (React + Vite, Docker)
              └─────┬──────┘
        ┌───────────┴───────────────┐
        ▼                           ▼
   ┌─────────┐                ┌────────────┐
   │  order  │                │    menu    │
   └───┬─────┘                └─────┬──────┘
       ▼                            ▼
    Postgres                     Postgres
```

## 3. Estrutura do repositório (monorepo)
O projeto utiliza uma estrutura de monorepo para facilitar o gerenciamento, mantendo a independência técnica de cada serviço:

```
BurgerStation/
├── order-service/        ← microsserviço de pedidos (NestJS)
├── menu-service/         ← microsserviço de cardápio (NestJS)
├── frontend/             ← interface do usuário (React + Vite)
├── docker-compose.yml    ← sobe toda a infraestrutura localmente
└── README.md
```

## 4. Stack
| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | NestJS + TypeScript |
| **Frontend** | React + Vite + TypeScript |
| **Banco** | PostgreSQL |
| **Testes** | Jest (unitários) + Cucumber/Gherkin (BDD) |
| **Containers** | Docker + Docker Compose |

## 5. Arquitetura Limpa
Cada serviço segue a organização em camadas para isolar as regras de negócio:

- **src/domain/**: Núcleo: entidades (`Pedido`, `MenuItem`), regras e interfaces de repositório.
- **src/application/**: Casos de uso (`FinalizarPedidoUseCase`, `ListarCardapioUseCase`) que orquestram o domínio.
- **src/infrastructure/**: Implementações concretas: Repositórios Postgres, Controllers (HTTP) e Gateways.

## 6. Princípios SOLID
- **S (Single Responsibility):** Cada caso de uso faz uma única coisa (ex: `FinalizarPedidoUseCase` apenas processa a finalização).
- **O (Open/Closed):** Novas estratégias de precificação entram como novas `EstrategiaPrecificacao` sem alterar o fluxo de checkout.
- **L (Liskov):** Repositórios em memória substituem o Postgres nos testes sem quebrar a aplicação.
- **I (Interface Segregation):** Interfaces específicas para cada contexto (`RepositorioPedido`, `ObservadorPedido`).
- **D (Dependency Inversion):** Casos de uso dependem de interfaces; as implementações concretas são injetadas via NestJS.

## 7. Design Patterns (4)
| Padrão | Onde | Arquivo |
| :--- | :--- | :--- |
| **Repository** | Acesso a dados desacoplado | `order.repository.ts` + `postgres-order.repository.ts` |
| **Factory** | Criação centralizada da entidade | `order.factory.ts` (`FabricaPedido`) |
| **Strategy** | Cálculo de desconto dinâmico | `strategies/percentage-discount.strategy.ts` |
| **Observer** | Notificação de novos pedidos | `order.observer.ts` (`PublicadorPedido`) |

## 8. Evidências de Clean Code
- **Nomenclatura Clara:** Uso de termos do negócio no código (ex: `EstrategiaTaxaFixa`, `RepositorioPedidoEmMemoria`).
- **Funções Pequenas:** Métodos focados e com responsabilidade única.
- **Tratamento de Erros:** Erros lançados de forma explícita quando uma regra de negócio é violada.

## 9. TDD — testes unitários
Os testes foram escritos antes da implementação, utilizando mocks e repositórios em memória.
```bash
# No diretório order-service
npm test
```

## 10. BDD — cenários Gherkin
Utilizamos cenários em português para validar as regras de desconto. Exemplo:
```gherkin
Funcionalidade: Cálculo de Desconto
  Cenário: Aplicar desconto percentual
    Dado que o valor do pedido é 100
    Quando eu aplico a estratégia de desconto de 10%
    Então o valor final deve ser 90
```
```bash
# Executar testes BDD
npm run test:bdd
```

## 11. Como rodar localmente
**Opção A — Docker Compose (Recomendado)**
```bash
docker compose up --build
```
Isso subirá o PostgreSQL, o Order Service (3001), o Menu Service (3002) e o Frontend (8080).

**Opção B — Manual (Desenvolvimento)**
1. Suba o banco de dados via Docker.
2. Em `order-service` e `menu-service`: `npm install && npm run start:dev`.
3. Em `frontend`: `npm install && npm run dev`.

## 12. Variáveis de Ambiente
Cada serviço possui seu arquivo `.env`. Principais variáveis:
- `PORT`: Porta de execução do serviço.
- `DATABASE_URL`: String de conexão com o PostgreSQL.
