import { Body, Controller, Post } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { WebhookSignature } from 'src/decorator/webhook.decorator';
import { WebhookDto } from 'src/dto/order.dto';
import { PaymentService } from 'src/services/payment.service';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }
    @ApiExcludeEndpoint()
    @Post('paid')
    async paid(@Body() payload: WebhookDto, @WebhookSignature() webhookSignature: string) {
        this.paymentService.paid(payload, webhookSignature);
    }
    @ApiExcludeEndpoint()
    @Post('failed')
    async failed(@Body() payload: WebhookDto, @WebhookSignature() webhookSignature: string) {
        this.paymentService.failed(payload, webhookSignature);
    }
}