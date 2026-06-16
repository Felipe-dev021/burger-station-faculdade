import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FinalizarPedidoUseCase } from '../application/finalizar-pedido.use-case';
import { ListarPedidosUseCase } from '../application/listar-pedidos.use-case';
import { MudarStatusPedidoUseCase } from '../application/mudar-status-pedido.use-case';
import { EstrategiaDescontoPercentual } from '../domain/estrategias/percentage-discount.strategy';
import { EstrategiaTaxaFixa } from '../domain/estrategias/fixed-fee.strategy';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly finalizarUseCase: FinalizarPedidoUseCase,
    private readonly listarUseCase: ListarPedidosUseCase,
    private readonly mudarStatusUseCase: MudarStatusPedidoUseCase
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
    return await this.listarUseCase.executar();
  }

  @Patch(':id/status')
  async mudarStatus(@Param('id') id: string, @Body('status') status: string) {
    await this.mudarStatusUseCase.executar(Number(id), status);
    return { success: true };
  }
}