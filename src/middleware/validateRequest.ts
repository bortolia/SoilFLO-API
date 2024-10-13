import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).send({
        msg: error.errors[0].message,
        item: error.errors[0].path,
      });
    } else {
      res.status(500).send({ msg: "error" });
    }
  }
};

export default validate;
