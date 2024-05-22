import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiConfigService {
    constructor(private configService: ConfigService) { }

    get jwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET');
    }
    get adminJWTExpireIn(): string {
        return this.configService.get<string>('ADMIN_JWT_EXPIRE_IN');
    }
    get userJWTExpireIn(): string {
        return this.configService.get<string>('USER_JWT_EXPIRE_IN');
    }
    get razorpayKeyId(): string {
        return this.configService.get<string>('RAZOR_KEY_ID');
    }
    get razorpayKeySecret(): string {
        return this.configService.get<string>('RAZOR_KEY_SECRET');
    }
    get razorpayWebhookSecret(): string {
        return this.configService.get<string>('RAZOR_WEBHOOK_SECRET');
    }
}