import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UNIT_SCHEMA } from 'src/schema';
import { UnitService } from 'src/services/unit.service';
import { UnitController } from './unit.controller';

@Module({
    imports: [MongooseModule.forFeature([UNIT_SCHEMA])],
    controllers: [UnitController],
    providers: [UnitService],
    exports: []
})
export class AppUnitModule { }