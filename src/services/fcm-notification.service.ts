import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotificationDto } from "src/dto/notification.dto";
import { User, UserDocument, UserModel } from "src/schema/user.schema";
const firebase = require("firebase-admin");
const serviceAccount = require('../../firebase-config.json')
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://pmart-1a19a-default-rtdb.firebaseio.com"
});

@Injectable()
export class FcmNotificationService {
    constructor(@InjectModel(UserModel.name) private userModel: Model<UserDocument>) { }

    async notification(token: string, notification: NotificationDto) {
        firebase.messaging().sendToDevice(token, notification, { priority: 'high', timeToLive: 60 * 60 * 24 });
    }

    async send(id: any, notification: NotificationDto) {
        const user: User = await this.userModel.findById(id).exec();
        if (user && user.device) {
            this.notification(user.device.deviceToken, notification);
        }
    }

}