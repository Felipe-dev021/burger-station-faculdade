export class ItemCardapio {
  constructor(
    public readonly id: number,
    public readonly nome: string,
    public readonly preco: number,
    public readonly categoria: string = 'Lanches',
    public readonly estoque: number = 10
  ) {}
}
