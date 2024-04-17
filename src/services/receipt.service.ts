import { PrismaClient } from "@prisma/client";
import { CreateReceiptDto } from "../dtos/receipt.dto";
import { MediaService } from "./media.service";
import { UserService } from "./user.service";
import database from "../database";

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

}