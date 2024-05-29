import { BadRequestException, Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { PipelineStage } from "mongoose";
import { SortOrderEnum } from "src/enum/common.enum";
import { OrderStatusEnum } from "src/enum/order.enum";
import { RoleEnum } from "src/enum/role.enum";
import { InquiryStatusEnum } from "src/enum/inquiry.enum";
import { ProductStatusEnum } from "src/enum/product.enum";
var XLSX = require("xlsx");

@Injectable()
export class UtilityService {

  setStartHour(date: Date, timezone: number) {
    const _timezoneDiff = (new Date().getTimezoneOffset()) - timezone;
    date.setHours(0, 0, 0, 0);
    if (_timezoneDiff != 0) {
      date.setHours(date.getHours() - Math.floor(_timezoneDiff / 60));
      date.setMinutes(date.getMinutes() - (_timezoneDiff % 60));
    }
    return date;
  }
  setEndHour(date: Date, timezone: number) {
    const _timezoneDiff = (new Date().getTimezoneOffset()) - timezone;
    date.setHours(23, 59, 59, 999);
    if (_timezoneDiff != 0) {
      date.setHours(date.getHours() - Math.floor(_timezoneDiff / 60));
      date.setMinutes(date.getMinutes() - (_timezoneDiff % 60));
    }
    return date;
  }
  slugify(string: string): string {
    return string
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }
  static getFileName(prefix: string, index: any = "") {
    return `${prefix}_${new Date().getTime()}${index}`;
  }
  static multerOptions(folder: string, prefix: string = "", fileType: string = "", limit: number = 0) {
    let options: any = {
      storage: diskStorage({
        destination: `./public/${folder}`,
        filename: (req, file, cb) => {
          return cb(null, `${this.getFileName(prefix)}${extname(file.originalname)}`)
        }
      })
    };
    if (fileType) {
      if (fileType = "image") {
        options.fileFilter = (req, file, callback) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return callback(new Error('Only images are allowed'), false);
          }
          callback(null, true);
        }
      }
    }
    if (limit) {
      options.limits = { fileSize: limit }
    }
    return options
  }
  static excelFileFilter() {
    return {
      fileFilter: (req: any, file: any, cb: any) => {
        if (['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].indexOf(file.mimetype) == -1)
          cb(new BadRequestException('Only xlsx or xls are allowed.'), false);
        cb(null, true);
      }
    }
  }
  readExcelFileData(file: any) {
    var workbook = XLSX.read(file.buffer);
    const sheetName = workbook.SheetNames;
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName[0]]);
  }
  getOrderNumber() {
    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const d = String(new Date().getDate()).padStart(2, '0');
    const hh = String(new Date().getHours()).padStart(2, '0');
    const mm = String(new Date().getMinutes()).padStart(2, '0');
    const ss = String(new Date().getSeconds()).padStart(2, '0');
    return `${y}${m}${d}${hh}${mm}${ss}`;
  }
  removeFile = (path: string) => {
    if (fs.existsSync("./public" + path)) {
      fs.unlinkSync("./public" + path)
    }
  }
  generateOTP = (otp_length: number) => {
    let digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < otp_length; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  };
  hashPassword = (password: string) => {
    return bcrypt.hash(password, Number(process.env.SALT_ROUND || 10));
  }
  comparePassword = (newPass: string, hash: string) => {
    return bcrypt.compare(newPass, hash);
  }
  getReferral() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 11; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  removeCommonProjection(data: any, onlyTimeStamp: boolean) {
    if (onlyTimeStamp)
      return { createdAt: 0, updatedAt: 0, __v: 0, ...data };
    else
      return { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isActive: 0, __v: 0, ...data };
  }
  getMatchPipeline(_match: any): PipelineStage.Match {
    return { $match: _match };
  }
  getSortPipeline(field: string, order: string): PipelineStage.Sort {
    let _sort: any = {};
    _sort[field] = order == SortOrderEnum.ASC ? 1 : -1;
    return { $sort: _sort };
  }
  getSkipPipeline(page: number, limit: number): PipelineStage.Skip {
    return { $skip: (page - 1) * limit };
  }
  getLimitPipeline(limit: number): PipelineStage.Limit {
    return { $limit: limit };
  }
  getUnwindPipeline(path: string): PipelineStage.Unwind {
    return { $unwind: { path: `$${path}`, preserveNullAndEmptyArrays: true } };
  }
  getLookupPipeline(from: string, localField: string, foreignField: string, as: string, pipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]): PipelineStage.Lookup {
    return {
      $lookup: {
        from: from,
        localField: localField,
        foreignField: foreignField,
        pipeline: pipeline,
        as: as
      }
    };
  }
  removeCommonProjectionPipeline(project: any, onlyTimeStamp: boolean): PipelineStage.Project {
    return { $project: { ...this.removeCommonProjection(project, onlyTimeStamp) } };
  }
  getProjectPipeline(project: any, isExclude: boolean): PipelineStage.Project {
    if (isExclude) {
      return { $project: { ...project, ...this.removeCommonProjection({}, false) } };
    }
    else {
      return { $project: { ...project } };
    }
  }
  getLookupPipelineWithLet(from: string, customlet: any, localField: string, foreignField: string, as: string, pipeline: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]): PipelineStage.Lookup {
    return {
      $lookup: {
        from: from,
        let: customlet,
        localField: localField,
        foreignField: foreignField,
        pipeline: pipeline,
        as: as
      }
    };
  }
  getAddFieldPipeline(field: string, key: any): PipelineStage.AddFields {
    let _addField: any = {};
    _addField[field] = key;
    return { $addFields: _addField };
  }
  getAddImageFieldPipeline(field: string, folder: string, key: any): PipelineStage.AddFields {
    let _addField: any = {};
    _addField[field] = { $concat: [process.env.DOC_BASE_URL, `${folder}/`, key] };
    return { $addFields: _addField };
  }
  projectImageFeild(folder: string, key: any) {
    return { $concat: [process.env.DOC_BASE_URL, `${folder}/`, key] };
  }
  getGroupPipeline(group: any): PipelineStage.Group {
    return { $group: { ...group } };
  }
  degreeToRadian(deg: number) {
    return deg * (Math.PI / 180)
  }
  getDistance(destinationLat: number, destinationLong: number, sourceLat: number, sourceLong: number) {
    const R: number = 6371; // Radius of the earth in km
    const destination = this.degreeToRadian(destinationLat);
    const source = this.degreeToRadian(sourceLat);
    const diffLat = this.degreeToRadian(sourceLat - destinationLat);
    const difflong = this.degreeToRadian(sourceLong - destinationLong);
    var a =
      Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
      Math.cos(destination) * Math.cos(source) *
      Math.sin(difflong / 2) * Math.sin(difflong / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }
  orderStatusCount(data: any) {
    let _obj: any = { Total: 0 };
    Object.values(OrderStatusEnum).forEach((key: any) => {
      _obj[key] = data[key] || 0;
      _obj['Total'] = _obj['Total'] + _obj[key];
    })
    return { ..._obj };
  }
  userCount(data: any) {
    let _obj: any = { Total: 0 };
    _obj[RoleEnum.USER] = data[RoleEnum.USER] || 0;
    _obj[RoleEnum.DELIVERY] = data[RoleEnum.DELIVERY] || 0;
    _obj['Total'] = _obj[RoleEnum.USER] + _obj[RoleEnum.DELIVERY];
    return { ..._obj };
  }
  inquiryStatusCount(data: any) {
    let _obj: any = { Total: 0 };
    Object.values(InquiryStatusEnum).forEach((key: any) => {
      _obj[key] = data[key] || 0;
      _obj['Total'] = _obj['Total'] + _obj[key];
    })
    return { ..._obj };
  }
  productStatusCount(data: any) {
    let _obj: any = { Total: 0 };
    Object.values(ProductStatusEnum).forEach((key: any) => {
      _obj[key] = data[key] || 0;
      _obj['Total'] = _obj['Total'] + _obj[key];
    })
    return { ..._obj };
  }
  getExcelProductSample() {
    const _data = [{
      sku: "",
      name: "",
      category: "",
      brand: "",
      unit: "",
      summary: "",
      description: "",
      weight: "",
      mrp: "",
      sell: "",
      quantity: "",
      gst: ""
    }]
    const ws = XLSX.utils.json_to_sheet(_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    return XLSX.write(wb, { type: "buffer" });
  }
}