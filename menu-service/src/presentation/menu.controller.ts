import { Controller, Get } from '@nestjs/common';
import { ListarCardapioUseCase } from '../application/list-menu.use-case';

@Controller('cardapio')
export class CardapioController {
  constructor(private readonly listarCardapioUseCase: ListarCardapioUseCase) {}

  @Get()
  buscarTodos() {
    return this.listarCardapioUseCase.executar();
  }
}