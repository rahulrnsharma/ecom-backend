import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FirbaseAuthGuard extends AuthGuard('firebase-auth') { }