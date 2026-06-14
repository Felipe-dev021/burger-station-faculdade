import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RepositorioPedidoPostgres } from '../infrastructure/repositorio-pedido-postgres';
import { FinalizarPedidoUseCase } from '../application/finalizar-pedido.use-case';
import { EstrategiaDescontoPercentual } from '../domain/estrategias/percentage-discount.strategy';
import { EstrategiaTaxaFixa } from '../domain/estrategias/fixed-fee.strategy';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly repo: RepositorioPedidoPostgres,
    private readonly finalizarUseCase: FinalizarPedidoUseCase
  ) {}

  @Post()
  async criar(@Body() body: { total: number; mesa: number; itens: string; tipoPagamento?: string }) {
    const estrategia = body.tipoPagamento === 'PIX' 
      ? new EstrategiaDescontoPercentual() 
      : new EstrategiaTaxaFixa();

    return await this.finalizarUseCase.executar(
      Number(body.total), 
      Number(body.mesa), 
      body.itens, 
      estrategia
    );
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
