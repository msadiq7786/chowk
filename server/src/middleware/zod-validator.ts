import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export function validateData(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as { body: Request["body"] };

      req.body = parsedData.body;

      next();
    } catch (error) {
      console.error("ZOD ERROR:", error);
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          message: `${issue.path.join(".")} ${issue.message}`,
        }));

        return res.status(400).json({
          error: "Invalid data",
          details: errorMessages,
        });
      }

      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  };
}
