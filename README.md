# 🍔 Burger Station (OrderLite)
---

## 1. Descrição do Problema e Proposta da Solução
**Problema:** Lanchonetes e bistrôs perdem tempo, dinheiro e organização anotando pedidos em comandas de papel, o que gera erros na cozinha e lentidão no fechamento das contas.
**Solução:** O *Burger Station* é um sistema digital de autoatendimento. O cliente visualiza o cardápio e monta sua própria comanda, que calcula descontos dinâmicos e envia o pedido diretamente para a cozinha, tudo de forma automatizada e à prova de falhas.

## 2. Divisão em Microsserviços
O backend foi dividido em dois serviços independentes em **NestJS**, garantindo resiliência:
- `menu-service`: Responsável apenas por listar o catálogo de produtos. Se o banco de pedidos cair, o cliente ainda consegue ver o cardápio.
- `order-service`: Responsável exclusivo pelo processamento, cálculo e salvamento dos pedidos.

## 3. Arquitetura Limpa e Organização das Camadas
O projeto (`order-service`) foi desenhado utilizando Clean Architecture para isolar as regras de negócio de frameworks e bancos de dados:
- **Domain:** Contém as entidades e regras de negócio puras (sem dependências externas).
- **Application:** Contém os *Use Cases* (casos de uso) que orquestram o fluxo do sistema.
- **Infrastructure:** Contém os *Controllers* (HTTP) e a persistência no banco (SQLite).

## 4. Evidências de Clean Code e Princípios SOLID
- **SRP (Responsabilidade Única):** Funções curtas e classes com apenas um motivo para mudar. O Controller apenas recebe a rota HTTP, o Use Case apenas orquestra e o Repository apenas salva.
- **DIP (Inversão de Dependência):** As camadas superiores não dependem de implementações concretas, mas de interfaces injetadas (Injeção de Dependência via NestJS).
- **Nomenclatura Limpa:** Uso de nomes descritivos para variáveis e métodos (`calculateDiscount`, `FinalizeOrderUseCase`), dispensando comentários óbvios.

## 5. Aplicação de Design Patterns (4 Padrões)
Foram implementados no `order-service` os seguintes padrões:
1. **Strategy:** Permite calcular o desconto do pedido dinamicamente no checkout (ex: `PercentageDiscountStrategy` para PIX e `FixedFeeStrategy` para Cartão) sem encher o código de `if/else`.
2. **Repository:** O `SqliteOrderRepository` isola a lógica de persistência de dados. O sistema não sabe se está salvando em memória, SQLite ou Postgres.
3. **Factory Method:** O `OrderFactory.create()` centraliza a criação da entidade `Order`, garantindo que um pedido sempre nasça com os atributos obrigatórios.
4. **Observer:** O `OrderPublisher` dispara eventos (notificações) de forma assíncrona assim que um pedido é finalizado, sem travar o fluxo principal.

## 6. Testes: TDD e BDD
A qualidade do software foi garantida por testes escritos **antes** da lógica de negócio:
- **TDD (Test-Driven Development):** Testes unitários rigorosos criados com **Jest** para validar as regras do domínio de pedidos.
- **BDD (Behavior-Driven Development):** Criação de cenários de comportamento usando a sintaxe **Gherkin/Cucumber** (`.feature`) para mapear as regras de negócio de descontos do Padrão Strategy.

## 7. Execução Local e Configuração Docker
O sistema foi totalmente containerizado. Foram criados *Dockerfiles* otimizados (multi-stage build) para cada serviço.
Para rodar a aplicação inteira (Frontend + 2 Microsserviços) na sua máquina, basta ter o Docker instalado e rodar o comando na raiz do projeto:
```bash
docker compose up --build
```