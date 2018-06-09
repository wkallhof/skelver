import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Response } from "express";

/**
 * Global Exception Filter for handling errors in the application
 *
 * @export
 * @class GlobalExceptionFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const message = (exception instanceof HttpException) ? exception.getResponse() : "Internal error";
        const status = (exception instanceof HttpException) ? exception.getStatus() : 500;
  
        const result = {
            error: {
                status: status,
                message: exception.message,
            }
        };

        const ctx = host.switchToHttp();
        const response : Response = ctx.getResponse();
        
        response.status(status).json(result);
    }
}