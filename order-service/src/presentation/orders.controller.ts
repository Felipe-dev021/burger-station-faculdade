import { Body, Controller, Get, Post } from '@nestjs/common';
import { FinalizarPedidoUseCase } from '../application/finalize-order.use-case';
import { ListarPedidosUseCase } from '../application/list-orders.use-case';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly finalizarPedidoUseCase: FinalizarPedidoUseCase,
    private readonly listarPedidosUseCase: ListarPedidosUseCase,
  ) {}

  @Post()
  criar(@Body('total') total: number) {
    return this.finalizarPedidoUseCase.executar(Number(total));
  }

  @Get()
  buscarTodos() {
    return this.listarPedidosUseCase.executar();
  }
}