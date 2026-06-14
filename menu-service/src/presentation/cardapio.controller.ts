import { Controller, Get } from '@nestjs/common';
import { ListarCardapioUseCase } from '../application/listar-cardapio-use-case';

@Controller('cardapio')
export class CardapioController {
  constructor(private readonly listarCardapioUseCase: ListarCardapioUseCase) {}

  @Get()
  async buscarTodos() {
    return await this.listarCardapioUseCase.executar();
  }
}
