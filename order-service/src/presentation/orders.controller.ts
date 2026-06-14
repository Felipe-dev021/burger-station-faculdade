import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RepositorioPedidoPostgres } from '../infrastructure/postgres-order.repository';
import { Pedido } from '../domain/order';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly repo: RepositorioPedidoPostgres) {}

  @Post()
  async criar(@Body() body: { total: number; mesa: number; itens: string }) {
    const novoPedido = new Pedido(Date.now(), Number(body.total), Number(body.mesa), 'PENDENTE', body.itens);
    await this.repo.salvar(novoPedido);
    return novoPedido;
  }

  @Get()
  async listar() {
    return await this.repo.buscarTodos();
  }

  @Patch(':id/status')
  async mudarStatus(@Param('id') id: string, @Body('status') status: string) {
    await this.repo.atualizarStatus(Number(id), status);
    return { success: true };
  }
}