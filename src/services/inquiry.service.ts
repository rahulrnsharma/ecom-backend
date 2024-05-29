import { BadRequestException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { InquiryDto, InquiryUpdateDto, SearchInquiryDto } from "src/dto/inquiry.dto";
import { SortOrderEnum } from "src/enum/common.enum";
import { InquiryEventEnum } from "src/enum/event.enum";
import { InquiryStatusEnum } from "src/enum/inquiry.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IContextUser } from "src/interface/user.interface";
import { Inquiry, InquiryDocument, InquiryModel } from "src/schema/inquiry.schema";
import { FirebaseService } from "./firebase.service";
import { UtilityService } from "./utility.service";
import { NotificationScreenEnum } from "src/enum/notification.enum";
import { NotificationDto } from "src/dto/notification.dto";
import { User, UserDocument, UserModel } from "src/schema/user.schema";

@Injectable()
export class InquiryService {
    constructor(@InjectModel(InquiryModel.name) private inquiryModel: Model<InquiryDocument>, @InjectModel(UserModel.name) private userModel: Model<UserDocument>, private readonly utilityService: UtilityService, private eventEmitter: EventEmitter2, private firebaseService: FirebaseService) { }

    async create(inquiryDto: InquiryDto, contextUser: IContextUser): Promise<any> {
        const inquiry: any = new this.inquiryModel({ type: inquiryDto.type, title: inquiryDto.title, user: contextUser.userId, createdBy: contextUser.userId, thread: [{ text: inquiryDto.text, from: contextUser.userId, role: contextUser.roles[0] }] });
        await inquiry.save();
        this.eventEmitter.emit(InquiryEventEnum.CREATED, { inquiryId: inquiry._id });
        return { inquiryId: inquiry._id };
    }
    async update(id: any, inquiryDto: InquiryUpdateDto, contextUser: IContextUser) {
        const _doc: Inquiry = await this.inquiryModel.findByIdAndUpdate(id, {
            $push: {
                'thread': { text: inquiryDto.text, from: contextUser.userId, role: contextUser.roles[0] }
            },
            updatedBy: contextUser.userId,
        },
            { new: true, runValidators: true }
        ).exec();
        if (_doc) {
            if (contextUser.roles[0] == RoleEnum.ADMIN) {
                this.sendNotification(_doc.user, { notification: { title: "Inquiry Reply", body: "You hav received a reply." }, data: { url: `pmart://${NotificationScreenEnum.INQUIRYDETAIL}/${id}` } });
            }
            const _last = _doc.thread.pop();
            this.eventEmitter.emit(InquiryEventEnum.UPDATED, { inquiryId: id, role: contextUser.roles[0], user: _doc.user, thread: _last });
            return _last;
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }
    async delete(id: any, contextUser: IContextUser) {
        const _doc: Inquiry = await this.inquiryModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are trying to delete does not exist.");
        }
    }
    async close(id: any, contextUser: IContextUser) {
        const _doc: Inquiry = await this.inquiryModel.findByIdAndUpdate(id, { status: InquiryStatusEnum.CLOSED, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are trying to close does not exist.");
        }
    }
    async getAll(searchDto: SearchInquiryDto, contextUser: any): Promise<any[]> {
        let _match: any = { isActive: true };
        if (contextUser.roles[0] != RoleEnum.ADMIN) {
            _match.user = new Types.ObjectId(contextUser.userId);
        }
        if (searchDto.status) {
            _match.status = searchDto.status;
        }
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match), this.utilityService.getSortPipeline('createdAt', SortOrderEnum.DESC),];
        query.push(this.utilityService.getProjectPipeline({ type: 1, status: 1, title: 1, createdAt: 1 }, false))
        let _res: any[] = await this.inquiryModel.aggregate(query).exec();
        return _res;
    }
    async getById(id: any): Promise<any> {
        let _match: any = { _id: new Types.ObjectId(id) };
        let query: PipelineStage[] = [this.utilityService.getMatchPipeline(_match)];
        query.push(this.utilityService.getProjectPipeline({ type: 1, status: 1, title: 1, thread: 1, createdAt: 1 }, false))
        let _res: any[] = await this.inquiryModel.aggregate(query).exec();
        return _res[0];
    }

    private async sendNotification(id: any, notification: NotificationDto) {
        const user: User = await this.userModel.findById(id).exec();
        if (user && user.device) {
            this.firebaseService.sendNotification(user.device.deviceToken, notification);
        }
    }
}