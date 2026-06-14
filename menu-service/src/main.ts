import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function inicializar() {
  const aplicacao = await NestFactory.create(AppModule);
  aplicacao.enableCors();
  const porta = Number(process.env.PORT ?? 3002);
  await aplicacao.listen(porta);
}

void inicializar();