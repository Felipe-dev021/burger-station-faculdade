import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { EstrategiaTaxaFixa } from '../../src/domain/strategies/fixed-fee.strategy';
import { EstrategiaDescontoPercentual } from '../../src/domain/strategies/percentage-discount.strategy';

let valorAtual = 0;
let resultadoAtual = 0;

Given('um pedido com total de {int} reais', (valor: number) => {
  valorAtual = valor;
});

When('eu aplico a estratégia de desconto percentual', () => {
  resultadoAtual = new EstrategiaDescontoPercentual().calcular(valorAtual);
});

When('eu aplico a estratégia de taxa fixa', () => {
  resultadoAtual = new EstrategiaTaxaFixa().calcular(valorAtual);
});

Then('o desconto calculado deve ser de {int} reais', (esperado: number) => {
  assert.equal(resultadoAtual, esperado);
});

Then('a taxa calculada deve ser de {int} reais', (esperado: number) => {
  assert.equal(resultadoAtual, esperado);
});