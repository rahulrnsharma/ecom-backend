import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET, 
        });
    }

    async validate(payload: any) {
        let _detail: any = await this.authService.getLoggedInDetail(payload.userId);
        if (_detail?._id == payload.loggedInId)
            return payload;
        else
            throw new UnauthorizedException()
    }
}