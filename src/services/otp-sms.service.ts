import { Injectable } from "@nestjs/common";
const sdk = require('api')('@msg91api/v5.0#3sl4d27aldk31ofj');

@Injectable()
export class OtpSmsService {
    constructor() { }

    async sendOtp() {
        sdk.sendotp({
            Param1: 'value1',
            Param2: 'value2',
            Param3: 'value3'
        }, {
            invisible: '%28Optional%29',
            otp: '%28Optional%29',
            userip: '%28Optional%29',
            otp_length: '%28Optional%29',
            otp_expiry: '%28Optional%29',
            extra_param: '%28Optional%29',
            unicode: '%28Optional%29',
            template_id: '',
            mobile: '',
            authkey: ''
        })
            .then(({ data }) => console.log(data))
            .catch(err => console.error(err));
    }
    async verifyOtp() {
        sdk.verifyOtp({ otp: '1234', mobile: '919999999999' })
            .then(({ data }) => console.log(data))
            .catch(err => console.error(err));
    }
    async resendOtp() {
        sdk.resendOtp({ authkey: '', retrytype: '', mobile: '' })
            .then(({ data }) => console.log(data))
            .catch(err => console.error(err));
    }
}