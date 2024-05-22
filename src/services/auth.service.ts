import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AdminLoginDto, AuthCheckDto, PasswordDto, LoginDto, AdminUserCreateDto, DeviceInfoDto } from "src/dto/login.dto";
import { RoleEnum } from "src/enum/role.enum";
import { IContextUser } from "src/interface/user.interface";
import { LoginDocument, LoginModel } from "src/schema/login.schema";
import { UserDocument, UserModel } from "src/schema/user.schema";
import { AdminUserService } from "./admin-user.service";
import { ApiConfigService } from "./config.service";
import { UserService } from "./user.service";
import { UtilityService } from "./utility.service";
const sdk = require('api')('@msg91api/v5.0#3sl4d27aldk31ofj');

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(LoginModel.name) private loginModel: Model<LoginDocument>,
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        private adminUserService: AdminUserService,
        private userService: UserService,
        private jwtService: JwtService,
        private utilityService: UtilityService,
        private apiConfigService: ApiConfigService
    ) { }

    async validateAdminUser(loginDto: AdminLoginDto): Promise<any> {
        const user: any = await this.adminUserService.findByUserNameAndPassword(loginDto);
        if (user) {
            const result: IContextUser = {
                userId: user._id,
                roles: [user.role]
            };
            return result;
        }
        return null;
    }

    async createAdmin(adminUserCreateDto: AdminUserCreateDto): Promise<any> {
        return this.adminUserService.createAdminUser(adminUserCreateDto);
    }

    async adminLogin(user: any, ipAddress: any, platform: any) {
        const login = await this.loginDetail(user.userId, user.roles[0], ipAddress, platform);
        user.loggedInId = login._id;
        return { token: this.jwtService.sign(user, { expiresIn: this.apiConfigService.adminJWTExpireIn }) };
    }

    async logout(user: any) {
        this.loginModel.findByIdAndUpdate(user.loggedInId, { loggedOut: new Date(), isLoggedIn: false }).exec();
        return { success: true }
    }
    async loginDetail(userId: any, role: string, ipAddress: string, platform: string) {
        return new this.loginModel({ user: userId, ip: ipAddress, role: role, loggedIn: new Date(), platform: platform }).save();
    }

    async getLoggedInDetail(id: any) {
        return this.loginModel.findOne({ user: new Types.ObjectId(id), isLoggedIn: true }, {}, { sort: { createdAt: -1 } });
    }

    async profile(user: any) {
        if (user.roles[0] == RoleEnum.ADMIN || user.roles[0] == RoleEnum.DATAMANAGEMENT) {
            return await this.adminUserService.findById(user.userId);
        }
        else {
            let _data: any[] = await this.userService.userProfile(user.userId);
            return _data[0];
        }
    }

    async login(loginDto: LoginDto) {
        let user: any = await this.userModel.findOne({ countryCode: loginDto.countryCode, mobile: loginDto.mobile, role: loginDto.role }).select("+password");
        if (!user) {
            throw new BadRequestException("User does not exist.");
        }
        if (!user.isActive) {
            throw new BadRequestException("This user has not been active.");
        }
        if (loginDto?.type == "Otp") {
            if (loginDto?.password != '1234') {
                throw new BadRequestException("Otp not valid.");
            }
        }
        if (loginDto?.type == "Password") {
            const isMatch = await this.utilityService.comparePassword(loginDto?.password, user?.password);
            if (!isMatch) {
                throw new BadRequestException("Invalid Credentials.");
            }
        }
        if (loginDto.referral) {
            await this.userService.checkReferral(loginDto.referral, user._id);
        }
        const login = await this.loginDetail(user._id, user.role, loginDto.ipAddress, loginDto.platform);
        return {
            token: this.jwtService.sign({ loggedInId: login._id, userId: user._id, roles: [user.role] }, { expiresIn: this.apiConfigService.userJWTExpireIn })
        };
    }

    async authCheck(authCheckDto: AuthCheckDto) {
        const response = await this.userModel.findOne(authCheckDto);
        if (!response) {
            if (authCheckDto.role == RoleEnum.DELIVERY) {
                throw new BadRequestException("Invalid Credentials.");
            }
            this.userService.createUser(authCheckDto, null);
            return { isPassword: false, isNew: true }
        } else {
            return { isPassword: response.isPassword, isNew: false }
        }
    }

    async setUserPassword(passwordDto: PasswordDto, contextUser: IContextUser) {
        let hash = await this.utilityService.hashPassword(passwordDto?.password);
        const response = await this.userModel.findByIdAndUpdate(contextUser.userId, { password: hash, isPassword: true }, { runValidators: true });
        if (response) {
            return { password: true }
        }
        else {
            return { password: false }
        }
    }

    async updateDevice(deviceInfoDto: DeviceInfoDto, contextUser: IContextUser) {
        return this.userService.updateDevice(deviceInfoDto, contextUser);
    }

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