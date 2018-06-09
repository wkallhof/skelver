import { HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

export class BaseController {

    public NotFound(message?:string) {
        throw new HttpException(message || "Not Found", HttpStatus.NOT_FOUND);
    }

    public BadRequest(message?:string) {
        throw new HttpException(message || "Bad Request", HttpStatus.BAD_REQUEST);
    }

    public Error(message?: string) {
        throw new HttpException(message || "Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public Redirect(res: Response, url: string) {
        res.redirect(url);
    }

    public Ok(res: Response) {
        res.status(200).send();
    }

    public JSON(res: Response, data: any) {
        res.status(200).json(data);
    }
}
