import { IsNotEmpty, IsString } from "class-validator";

export class CreateReceiptDto {

    @IsString()
    @IsNotEmpty()
    share_code: string;
    
}