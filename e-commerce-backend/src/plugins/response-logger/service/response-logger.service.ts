import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware {
  handler = (req: Request, res: Response, next: NextFunction) => {
    // Log incoming request
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);

    // Capture the original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to log the response
    res.json = function (body) {
      console.log('Response Body:', body);
      return originalJson.call(this, body);
    };

    res.send = function (body) {
      console.log('Response Body:', body);
      return originalSend.call(this, body);
    };

    // Log response when it's finished
    res.on('finish', () => {
      console.log(`Response Status: ${res.statusCode}`);
      console.log('Response Headers:', res.getHeaders());
    });

    next();
  }
}