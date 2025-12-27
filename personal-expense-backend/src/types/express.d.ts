import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email?: string;
        user_metadata?: Record<string, any>;
        app_metadata?: Record<string, any>;
        [key: string]: any;
      };
    }
  }
}

export {};