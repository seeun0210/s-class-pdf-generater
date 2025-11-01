import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || '8080';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'pdf.generation',
      protoPath: join(__dirname, 'proto', 'pdf-generation.proto'),
      url: `0.0.0.0:${port}`,
    },
  });
  await app.startAllMicroservices();
  // HTTP 서버는 시작하지 않음 (마이크로서비스만 사용)
}
void bootstrap();
