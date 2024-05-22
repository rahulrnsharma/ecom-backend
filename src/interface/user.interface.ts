import { ObjectId } from "mongoose";
import { Socket } from 'socket.io';

export interface IContextUser {
    loggedInId?: ObjectId;
    userId: ObjectId;
    roles: String[];
}

export interface ISocket extends Socket {
    user?: IContextUser;
}