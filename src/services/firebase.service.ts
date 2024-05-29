import { Injectable, UnauthorizedException } from "@nestjs/common";
import { NotificationDto } from "src/dto/notification.dto";
const firebase = require("firebase-admin");
const serviceAccount = require('../../firebase-config.json')
const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://pmart-1a19a-default-rtdb.firebaseio.com"
});

@Injectable()
export class FirebaseService {
    constructor() { }

    private async notification(token: string, notification: NotificationDto) {
        firebase.messaging().sendToDevice(token, notification, { priority: 'high', timeToLive: 60 * 60 * 24 });
    }
    async sendNotification(deviceToken: any, notification: NotificationDto) {
        this.notification(deviceToken, notification);
    }
    async validateToken(token: string) {
        return await firebaseApp.auth().verifyIdToken(token, true).catch((err: any) => {
            // console.log("err", err);
            throw new UnauthorizedException(err.message);
        })
    }
    async createUser(phone: string) {
        return await firebaseApp.auth().createUser({
            phoneNumber: phone,
            disabled: false,
        });
    }
    async setCustomUserClaims(uid: string, claims: any) {
        return await firebaseApp.auth().setCustomUserClaims(uid, claims);
    }
}