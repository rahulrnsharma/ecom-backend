import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  const config = new DocumentBuilder()
    .setTitle('esale')
    .setDescription('The esale API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(helmet({ crossOriginResourcePolicy: false }));
  const httpAdapter = app.get(HttpAdapterHost, { strict: true });
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    enableDebugMessages: true,
    stopAtFirstError: true,
    forbidUnknownValues: false,
    exceptionFactory: (error: ValidationError[]) => {
      const _error = error[0];
      return new BadRequestException(Object.values(_error?.constraints)[0]);
    }
  }));
  app.enableCors();
  console.log(process.env.DOC_BASE_URL,"this is base url")
  console.log(process.env.DB_URL,"This is MongoDB URL")
  await app.listen(5000);
}
bootstrap();
