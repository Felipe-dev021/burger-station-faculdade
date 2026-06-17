import { Controller, Get } from '@nestjs/common';
import { ListarCardapioUseCase } from '../application/listar-cardapio-use-case';

@Controller('cardapio')
export class CardapioController {
  constructor(private readonly listarCardapioUseCase: ListarCardapioUseCase) {}

  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get()
  async buscarTodos() {
    return await this.listarCardapioUseCase.executar();
  }
}
