import { PrismaClient } from "@prisma/client";
import { CreateReceiptDto, GetReceiptDto } from "../dtos/receipt.dto";
import { MediaService } from "./media.service";
import { UserService } from "./user.service";
import database from "../database";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";
import { QueryFilter } from "../interfaces/query.interface";

export class ReceiptService {

    private readonly mediaService: MediaService;
    private readonly userService: UserService;
    private readonly ormService: PrismaClient;

    constructor() {
        this.userService = new UserService()
        this.mediaService = new MediaService();
        this.ormService = database.getClient()
    }

    async create(dto: CreateReceiptDto, businessId: number, file: Express.Multer.File) {

        const token = await this.userService.validateShareCode(dto.share_code);

        const filePath = await this.mediaService.uploadReceipt(file);

        await this.ormService.receipt.create({
            data: {
                business_id: businessId,
                user_id: token.user_id,
                file_path: filePath
            }
        })

        return "Receipt Created Successfully"

    }

    async get(userId: number, dto: GetReceiptDto) {

        let endDate = new Date()
        
        if(dto.end_date) {
            endDate = new Date(dto.end_date)
        }

        let startDate = new Date(endDate)
        startDate.setMonth(startDate.getMonth() - 3)

        if(dto.start_date) {
            startDate = new Date(dto.start_date)
        }

        if (startDate.getTime() >= endDate.getTime()) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST,
                'End date must be greater than start date'
            )
        }

        const limit = dto.limit ? parseInt(dto.limit) : 50
        
        let query: QueryFilter = {
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                },
                user_id: userId,
            },
            take: limit,
            orderBy: {
                created_at: 'desc'
            }
        }
        
        if(dto.search) {
            query.where.business = {
                name: {
                    contains: dto.search
                }
            }
        }

        const results = await this.ormService.receipt.findMany({
            ...query,
            include: {
                business: true
            }
        })
        const receipts = results.map(r => {
            const formattedBusiness = this.userService.exclude(r.business, this.userService.excludedFields);
            return {...r, business: formattedBusiness}
        })
        
        return { 
            results: receipts,
            limit 
        }

    }

    async stats() {
        const receipts = await this.ormService.receipt.count();
        const businesses = (await this.ormService.receipt.groupBy({
            by: ["business_id"],
        })).length
        
        return {
            receipts,
            businesses
        }
    }

}