import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BannerDto } from "src/dto/banner.dto";
import { IContextUser } from "src/interface/user.interface";
import { Banner, BannerDocument, BannerModel } from "src/schema/banner.schema";


@Injectable()
export class BannerService {
    constructor(
        @InjectModel(BannerModel.name) private bannerModel: Model<BannerDocument>
    ) { }

    async create(bannerDto: BannerDto, contextUser: IContextUser, filename: string) {
        let _banner = {
            ...bannerDto,
            createdBy: contextUser.userId,
            image: filename || ""
        };
        const brand = new this.bannerModel(_banner);
        return brand.save();
    }

    async update(id: string, bannerDto: BannerDto, contextUser: IContextUser, filename: string) {
        let banner: any = {
            ...bannerDto,
        };
        if (filename) {
            banner['image'] = filename;
        } else {
            delete banner.image;
        }
        const _doc: Banner = await this.bannerModel.findByIdAndUpdate(id, { $set: { ...banner, updatedBy: contextUser.userId } }, { new: true, runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are update does not exist.");
        }
    }

    async delete(id: string, contextUser: IContextUser) {
        const _doc: Banner = await this.bannerModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are delete does not exist.");
        }
    }
    async getAll(): Promise<Banner[]> {
        return this.bannerModel.find({}).exec();
    }
    async getById(id: any): Promise<Banner> {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner) {
            throw new BadRequestException("Resource you are looking does not exist.");
        }
        return banner
    }
    async getByType(type: string): Promise<Banner[]> {
        return this.bannerModel.find({ isActive: true, type: type }).exec();
    }
}