import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserRegisterDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    username: string;

}

export class UserLoginDto {
    
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    push_token?: string;

}