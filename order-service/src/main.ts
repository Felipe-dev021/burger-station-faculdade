import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // O 'C' minúsculo no final é importante aqui no Nest!
  await app.listen(process.env.PORT || 3001);
}
bootstrap();