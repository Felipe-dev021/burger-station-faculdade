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
O projeto utiliza uma estrutura de monorepo, mantendo a independência técnica de cada serviço:

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

- **src/domain/**: Núcleo (Linguagem Ubíqua):
  - `entidades/`: Regras e objetos de negócio (`Pedido`).
  - `repositorios/`: Contratos de acesso a dados.
  - `estrategias/`: Regras de precificação (Strategy).
  - `fabricas/`: Criação de objetos complexos (Factory).
  - `observadores/`: Comunicação entre componentes (Observer).
- **src/application/**: Casos de uso (`FinalizarPedidoUseCase`) que orquestram o fluxo.
- **src/infrastructure/**: Implementações concretas (Postgres, Console Log).
- **src/presentation/**: Controladores de entrada (HTTP).

## 6. Princípios SOLID
- **S (Single Responsibility):** Classes pequenas e focadas.
- **O (Open/Closed):** Adição de novos descontos via Strategy sem alterar o checkout.
- **L (Liskov):** Repositórios em memória substituem o real nos testes.
- **I (Interface Segregation):** Interfaces magras e específicas.
- **D (Dependency Inversion):** Uso intensivo de Injeção de Dependência via NestJS.

## 7. Design Patterns (5 Aplicados)
| Padrão | Onde | Arquivo |
| :--- | :--- | :--- |
| **Repository** | Desacoplamento de dados | `repositorios/pedido.repository.ts` |
| **Factory Method** | Criação centralizada | `fabricas/pedido.factory.ts` |
| **Strategy** | Descontos dinâmicos | `estrategias/percentage-discount.strategy.ts` |
| **Observer** | Notificação de eventos | `observadores/pedido.observer.ts` |
| **Decorator** | Logs de banco sem poluir o código | `repositorios/pedido.repository.log-decorator.ts` |

## 8. Evidências de Clean Code
- **Linguagem Ubíqua:** Nomes de domínio em português para fidelidade ao negócio.
- **Composição sobre Herança:** Uso de Decorator para extender funcionalidades.
- **Ausência de Comentários:** O código é autoexplicativo através de nomes claros.

## 9. TDD e BDD
- **TDD:** Testes unitários (`npm test`) criados antes da implementação.
- **BDD:** Cenários Gherkin em português para validação de comportamentos.

## 10. Como rodar localmente
```bash
docker compose up --build
```
Acesse o sistema em [http://localhost:8080](http://localhost:8080).

## 11. 🔗 Acesso ao sistema (Deploy Ativo)
A aplicação está publicada e funcional utilizando serviços de nuvem gratuitos e escaláveis.

| O quê | Link |
| :--- | :--- |
| **Aplicação (Frontend)** | [https://burger-station-faculdade-git-main-zezim.vercel.app/](https://burger-station-faculdade-git-main-zezim.vercel.app/) |
| **API Pedidos (Swagger)** | [https://burger-order-api.onrender.com/docs](https://burger-order-api.onrender.com/docs) |
| **API Cardápio (Swagger)** | [https://burger-menu-api.onrender.com/docs](https://burger-menu-api.onrender.com/docs) |

> **Nota:** Os serviços no Render entram em hibernação após 15 min de inatividade. O primeiro acesso pode levar cerca de 30 segundos para "acordar".

## 12. Justificativa Técnica das Escolhas
- **Vercel (Frontend):** Escolhida pela integração nativa com React/Vite e excelente performance global (Edge Network).
- **Render (Backend):** Utilizado para hospedar os microsserviços em containers Docker de forma isolada e gratuita.
- **Neon (PostgreSQL):** Banco de dados Serverless que permite separar os dados de cada microsserviço com alta disponibilidade e custo zero para o projeto.
- **Monorepo:** Facilita a gestão de múltiplos serviços em um único lugar, mantendo a independência de build e deploy de cada um.
