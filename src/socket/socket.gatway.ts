import { OnEvent } from '@nestjs/event-emitter';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WsException } from '@nestjs/websockets/errors';
import { Server } from 'socket.io';
import { InquiryEventEnum, OrderEventEnum, UserEventEnum } from 'src/enum/event.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { ISocket } from 'src/interface/user.interface';
import { SocketService } from 'src/services/socket.service';

@WebSocketGateway({
    transports: ['websocket'],
    cors: {
        origin: '*'
    },
    pingInterval: 10000,
    pingTimeout: 15000,
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() wss: Server;

    constructor(private socketService: SocketService) {
    }

    afterInit(server: Server): void {
    }

    async handleDisconnect(client: ISocket) {
        let user: any;
        if (client.handshake.query.role == RoleEnum.ADMIN) {
            user = await this.socketService.verify(
                client.handshake.query.token
            );
        }
        else {
            const _user: any = await this.socketService.verifyFirebaseToken(client.handshake.query.token);
            user = { user_id: _user.user_id, phone_number: _user.phone_number, userId: _user.userId, roles: [_user.role] }
        }

        if ([RoleEnum.ADMIN, RoleEnum.DATAMANAGEMENT].includes(user.roles[0])) {
            this.socketService.removeAdminUserSocket(user.userId);
        }
        if ([RoleEnum.USER, RoleEnum.DELIVERY].includes(user.roles[0])) {
            this.socketService.removeUserSocket(user.userId.toString());
        }
    }

    async handleConnection(client: ISocket) {
        const user: any = await this.socketService.verify(
            client.handshake.query.token
        );
        if (!user) {
            client._error(new WsException("invalid token"))
            client.disconnect(true);
        }
        client.user = user;
        if ([RoleEnum.ADMIN, RoleEnum.DATAMANAGEMENT].includes(user.roles[0])) {
            this.socketService.setAdminUserSocket(user.userId.toString(), client);
        }
        if ([RoleEnum.USER, RoleEnum.DELIVERY].includes(user.roles[0])) {
            this.socketService.setUserSocket(user.userId.toString(), client);
        }
    }

    //inquiry event
    @OnEvent(InquiryEventEnum.CREATED)
    handleCreateInquiryEvent(payload: any) {
        this.socketService.getAllAdminSockets().forEach((client: ISocket) => {
            client.emit(InquiryEventEnum.CREATED, payload);
        });
    }

    @OnEvent(InquiryEventEnum.UPDATED)
    handleUpdateInquiryEvent(payload: any) {
        if ([RoleEnum.ADMIN, RoleEnum.DATAMANAGEMENT].includes(payload.role)) {
            let _socket = this.socketService.getUserSocket(payload.user.toString());
            if (_socket) {
                _socket.emit(InquiryEventEnum.UPDATED, { inquiryId: payload.inquiryId, thread: payload.thread });
            }
        }
        else {
            this.socketService.getAllAdminSockets().forEach((client: ISocket) => {
                client.emit(InquiryEventEnum.UPDATED, { inquiryId: payload.inquiryId, thread: payload.thread });
            });
        }
    }
    //order event
    @OnEvent(OrderEventEnum.ORDERNEW)
    handleOrderNewEvent(payload: any) {
        this.socketService.getAllAdminSockets().forEach((client: ISocket) => {
            client.emit(OrderEventEnum.ORDERNEW, { orderId: payload.orderId });
        });
    }
    @OnEvent(OrderEventEnum.ORDERPAID)
    handleOrderPaidEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(OrderEventEnum.ORDERPAID, { orderId: payload.orderId });
        }
    }
    @OnEvent(OrderEventEnum.STATUSCHANGE)
    handleOrderStatusEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(OrderEventEnum.STATUSCHANGE, { orderId: payload.orderId, status: payload.status, reason: payload.reason || "" });
        }
    }
    @OnEvent(OrderEventEnum.ORDERASSIGN)
    handleOrderAssignEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(OrderEventEnum.ORDERASSIGN, { orderId: payload.orderId });
        }
    }
    @OnEvent(OrderEventEnum.ORDETRACK)
    handleOrderTrackEvent(payload: any) {
        this.socketService.getAllUserSockets().forEach((client: ISocket) => {
            client.emit(OrderEventEnum.ORDETRACK, { orderId: payload.orderId, lastLocation: payload.lastLocation });
        });
    }
    //user event
    @OnEvent(UserEventEnum.WALLETADD)
    handleWalletAddEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(UserEventEnum.WALLETADD, payload);
        }
    }
}