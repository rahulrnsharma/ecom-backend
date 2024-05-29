import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SearchUnitDto, UnitDto } from "src/dto/unit.dto";
import { ActiveStatusEnum } from "src/enum/common.enum";
import { IContextUser } from "src/interface/user.interface";
import { Unit, UnitDocument, UnitModel } from "src/schema/unit.schema";


@Injectable()
export class UnitService {
    constructor(@InjectModel(UnitModel.name) private unitModel: Model<UnitDocument>) { }

    async create(unitDto: UnitDto, contextUser: IContextUser): Promise<Unit> {
        const unit = new this.unitModel({ ...unitDto, createdBy: contextUser.userId });
        return unit.save();
    }
    async update(id: any, unitDto: UnitDto, contextUser: IContextUser): Promise<Unit> {
        const _doc: Unit = await this.unitModel.findByIdAndUpdate(id, { $set: { ...unitDto, updatedBy: contextUser.userId } }, { runValidators: true }).exec();
        if (_doc) {
            return _doc
        }
        else {
            throw new BadRequestException("Resource you are trying to update does not exist.");
        }
    }
    async delete(id: any, contextUser: IContextUser) {
        const _doc: Unit = await this.unitModel.findByIdAndUpdate(id, { isActive: false, updatedBy: contextUser.userId }, { runValidators: true }).exec();
        if (_doc) {
            return { success: true };
        }
        else {
            throw new BadRequestException("Resource you are trying to delete does not exist.");
        }
    }
    async getAll(query: SearchUnitDto): Promise<Unit[]> {
        let _cond: any = {};
        if (query.status) {
            _cond['isActive'] = query.status == ActiveStatusEnum.ACTIVE;
        }
        return this.unitModel.find(_cond).exec();
    }
    async getById(id: any): Promise<Unit> {
        return this.unitModel.findById(id).exec();
    }

    async dropdown() {
        return this.unitModel.find({ isActive: true }, { _id: 1, name: 1 }).exec();
    }

}