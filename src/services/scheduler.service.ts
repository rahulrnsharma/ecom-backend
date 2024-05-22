import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Deal, DealDocument, DealModel } from 'src/schema/deal.schema';
import { ProductDocument, ProductModel } from 'src/schema/product.schema';
import { UtilityService } from './utility.service';
import { DealTypeEnum } from 'src/enum/common.enum';

@Injectable()
export class SchedulerService {

    constructor(@InjectModel(DealModel.name) private dealModel: Model<DealDocument>,
        @InjectModel(ProductModel.name) private productModel: Model<ProductDocument>,
        private utilityService: UtilityService) { }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleDealCheckCron() {
        let _today: Date = this.utilityService.setStartHour(new Date(), -330);
        let _data: any[] = await this.dealModel.find({ isActive: true, endDate: { $lte: _today } });
        for (let i = 0; i < _data.length; i++) {
            if (_data[i].type == DealTypeEnum.DAILY) {
                await this.updateDailyDeal(_data[i]._id, _data[i].startDate, _data[i].endDate)
            }
            else {
                await this.deleteDeal(_data[i]._id);
            }
        }
    }

    async updateDailyDeal(id: any, startDate: Date, endDate: Date) {
        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);
        await this.dealModel.findByIdAndUpdate(id, { $set: { startDate: startDate, endDate: endDate } });
    }

    async deleteDeal(id: any) {
        const _doc: Deal = await this.dealModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { runValidators: true }).exec();
        if (_doc) {
            await this.productModel.updateMany({ deal: new Types.ObjectId(id) }, { $set: { deal: null } }).exec();
        }
    }
}