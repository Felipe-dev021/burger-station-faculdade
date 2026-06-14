export class Pedido {
  constructor(
    public id: number,
    public total: number,
    public mesa: number,
    public status: 'PENDENTE' | 'COZINHA' | 'PRONTO' | 'ENTREGUE' = 'PENDENTE',
    public itens: string = ''
  ) {}
}