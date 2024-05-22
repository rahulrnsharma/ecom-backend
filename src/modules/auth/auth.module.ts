import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ADMINUSER_SCHEMA, LOGIN_SCHEMA, USER_SCHEMA } from 'src/schema';
import { AuthService } from 'src/services/auth.service';
import { ApiConfigService } from 'src/services/config.service';
import { SocketService } from 'src/services/socket.service';
import { JwtStrategy } from 'src/services/strategy/jwt.strategy';
import { LocalStrategy } from 'src/services/strategy/local.strategy';
import { UtilityService } from 'src/services/utility.service';
import { SocketGateway } from 'src/socket/socket.gatway';
import { AppUserModule } from '../user/user.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET')
            }),
            inject: [ConfigService]
        }), MongooseModule.forFeature([USER_SCHEMA, ADMINUSER_SCHEMA, LOGIN_SCHEMA]), AppUserModule],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, ApiConfigService, UtilityService, SocketService, SocketGateway],
    exports: [AuthService]
})
export class AppAuthModule { }