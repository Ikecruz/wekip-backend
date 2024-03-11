import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

export class VerifyEmailDto {

    @IsString()
    @IsIn(["user", "business"])
    group: "user" | "business"

    @IsString()
    @IsNotEmpty()
    token: string; 
}

export class BusinessRegisterDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}

export class BusinessLoginDto {
    
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}