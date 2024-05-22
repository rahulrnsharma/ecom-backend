import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const WebhookSignature = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['X-Razorpay-Signature']
});