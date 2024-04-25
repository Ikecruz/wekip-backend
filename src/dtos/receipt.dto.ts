import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateReceiptDto {

    @IsString()
    @IsNotEmpty()
    share_code: string;
    
}

export class GetReceiptDto {

    @IsString()
    @IsOptional()
    start_date?: string

    @IsString()
    @IsOptional()
    end_date?: string

    @IsString()
    @IsOptional()
    limit?: string

    @IsString()
    @IsOptional()
    search?: string

}