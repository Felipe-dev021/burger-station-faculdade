import { EstrategiaPrecificacao } from './pricing.strategy';

export class EstrategiaDescontoPercentual implements EstrategiaPrecificacao {
  calcular(valor: number): number {
    return valor * 0.1;
  }
}