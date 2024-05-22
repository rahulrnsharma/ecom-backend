import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SiteConfigDto } from "src/dto/site-config.dto";
import { IContextUser } from "src/interface/user.interface";
import { SiteConfig, SiteConfigDocument, SiteConfigModel } from "src/schema/site-config.schema";


@Injectable()
export class SiteConfigService {
    constructor(@InjectModel(SiteConfigModel.name) private siteConfigModel: Model<SiteConfigDocument>) { }

    async create(siteConfigDto: SiteConfigDto, contextUser: IContextUser): Promise<SiteConfig> {
        let _doc: any = await this.siteConfigModel.findOne({ isActive: true });
        if (_doc) {
            return this.siteConfigModel.findOneAndUpdate({}, { $set: { ...siteConfigDto, updatedBy: contextUser.userId } }, { runValidators: true, new: true });
        }
        else {
            _doc = new this.siteConfigModel({ ...siteConfigDto, createdBy: contextUser.userId });
        }
        return _doc.save();
    }
    async getAll(): Promise<SiteConfig> {
        return this.siteConfigModel.findOne({ isActive: true }).exec();
    }

    async getSiteConfig(): Promise<SiteConfig> {
        return this.siteConfigModel.findOne({ isActive: true }, { name: 1, street: 1, city: 1, state: 1, country: 1, location: 1, pincode: 1, countryCode: 1, mobile: 1, landline: 1 }).exec();
    }

}