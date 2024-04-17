import { UploadApiResponse, v2 } from "cloudinary"
import fs from "fs"
import path, { join, resolve } from "path";
// import { PutObjectCommand, PutObjectRequest, S3, S3Client } from "@aws-sdk/client-s3";
import * as AWS from "aws-sdk"
import { S3 } from "aws-sdk"

export class MediaService {

    private readonly s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3();
    }

    async uploadImage(
        file: Express.Multer.File,
        folder: string
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            v2.uploader.upload(file.path, { folder }, (error, value) => {
                if (error) reject(error);
                fs.unlink(path.resolve(file.path as string), () => {})
                resolve(value as UploadApiResponse)
            })
        })
    }

    async uploadReceipt(file: Express.Multer.File): Promise<string>{
        return new Promise( async (resolve, reject) => {

            const stream = fs.createReadStream(file.path);

            const params: S3.Types.PutObjectRequest = {
                Bucket: "wekip-receipts",
                Key: file.filename,
                Body: stream
            }

            try {
                const result = await this.s3.upload(params).promise();
                fs.unlink(path.resolve(file.path as string), () => {})
                resolve(result.Location)                
            } catch (error) {
                reject(error)
            }

        })
    }

}