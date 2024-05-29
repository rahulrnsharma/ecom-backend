import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { FirebaseService } from '../firebase.service';

@Injectable()
export class FirbaseAuthStrategy extends PassportStrategy(Strategy, 'firebase-auth') {
    constructor(private firebaseService: FirebaseService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate(token: string) {
        const _user: any = await this.firebaseService.validateToken(token);
        if (_user)
            return { user_id: _user.user_id, phone_number: _user.phone_number, userId: _user.userId, roles: [_user.role] };
        else
            throw new UnauthorizedException()
    }
}