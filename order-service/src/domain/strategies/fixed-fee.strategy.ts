import { EstrategiaPrecificacao } from './pricing.strategy';

export class EstrategiaTaxaFixa implements EstrategiaPrecificacao {
  calcular(_valor: number): number {
    return 5;
  }
}