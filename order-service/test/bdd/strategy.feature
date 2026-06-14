Feature: Estratégia de precificação do pedido
  Como o sistema Burger Station
  Quero aplicar regras de desconto e taxa
  Para calcular o valor final do pedido corretamente

  Scenario: aplicar 10 por cento de desconto em pedidos elegíveis
    Given um pedido com total de 150 reais
    When eu aplico a estratégia de desconto percentual
    Then o desconto calculado deve ser de 15 reais

  Scenario: aplicar uma taxa fixa na regra de entrega
    Given um pedido com total de 80 reais
    When eu aplico a estratégia de taxa fixa
    Then a taxa calculada deve ser de 5 reais