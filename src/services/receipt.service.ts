import { PrismaClient, Receipt } from "@prisma/client";
import { CreateReceiptDto, GetReceiptDto } from "../dtos/receipt.dto";
import { MediaService } from "./media.service";
import { UserService } from "./user.service";
import database from "../database";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";
import { QueryFilter } from "../interfaces/query.interface";
import moment from "moment";
import NotificationService from "./notification.service";

export class ReceiptService {

    private readonly mediaService: MediaService;
    private readonly userService: UserService;
    private readonly ormService: PrismaClient;
    private readonly notificationService: NotificationService;

    constructor() {
        this.userService = new UserService()
        this.mediaService = new MediaService();
        this.notificationService = new NotificationService();
        this.ormService = database.getClient()
    }

    async create(dto: CreateReceiptDto, businessId: number, file: Express.Multer.File) {

        const token = await this.userService.validateShareCode(dto.share_code);
        const user = await this.ormService.user.findFirst({
            where: {
                id: token.user_id
            }
        })
        const filePath = await this.mediaService.uploadReceipt(file);

        await this.ormService.receipt.create({
            data: {
                business_id: businessId,
                user_id: token.user_id,
                file_path: filePath
            }
        })

        if (user?.push_token) {
            this.notificationService.sendNotification(
                [user.push_token],
                "Your Receipt Upload: Complete!",
                "Great news! Your recent receipt upload was successful. Keep track of your expenses effortlessly"
            )
        }

        return "Receipt Created Successfully"

    }

    private formatReceipts(receipts: Receipt[]) {
        const groups = receipts.reduce((groups: any, receipt: Receipt) => {
            const date = moment(receipt.created_at).format('YYYY-MM-DD')
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(receipt)
            return groups
        }, {})
        const groupArrays = Object.keys(groups).map((date) => {
            return {
                date,
                receipts: groups[date]
            }
        })
        return groupArrays
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
            results: this.formatReceipts(receipts),
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