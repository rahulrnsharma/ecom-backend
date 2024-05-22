import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddressDto, LocationDto } from "src/dto/address.dto";
import { IContextUser } from "src/interface/user.interface";
import { UserAddress, UserAddressDocument, UserAddressModel } from "src/schema/user-address.schema";
import { SiteConfigService } from "./site-config.service";
import { UtilityService } from "./utility.service";


@Injectable()
export class UserAddressService {
    constructor(@InjectModel(UserAddressModel.name) private userAddressModel: Model<UserAddressDocument>,
        private siteConfigService: SiteConfigService, private utilityService: UtilityService) { }

    async create(addressDto: AddressDto, contextUser: IContextUser): Promise<UserAddress> {
        const address = new this.userAddressModel({ ...addressDto, user: contextUser.userId, createdBy: contextUser.userId });
        return address.save();
    }
    async update(id: any, addressDto: AddressDto, contextUser: IContextUser): Promise<UserAddress> {
        const _doc: UserAddress = await this.userAddressModel.findByIdAndUpdate(id, { $set: { ...addressDto, updatedBy: contextUser.userId } }, { runValidators: true }).exec();
        if (_doc) {
            return _doc;
        }
        else {
            throw new BadRequestException("Resource you are looking for not exist.");
        }
    }
    async delete(id: any, contextUser: IContextUser) {
        const _doc: UserAddress = await this.userAddressModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are looking for not exist.");
        }
    }
    async getAllByUser(contextUser: IContextUser): Promise<UserAddress[]> {
        return this.userAddressModel.find({ isActive: true, user: contextUser.userId }).exec();
    }
    async getById(id: any): Promise<UserAddress> {
        return this.userAddressModel.findById(id).exec();
    }

    async checkAddress(location: LocationDto) {
        const _config: any = await this.siteConfigService.getAll();
        const _distance: number = this.utilityService.getDistance(_config.location.lat, _config.location.long, Number(location.lat), Number(location.long));
        return { available: _distance < _config.deliveryRange, distance: _distance };
    }
}