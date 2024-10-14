import { httpRequestDurationMilliseconds } from "../metrics/promMetrics";
import { Request, Response, NextFunction } from "express";

const requestDuration = (req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDurationMilliseconds.startTimer();
  const route = req.baseUrl + req.path;
  res.on("finish", () => {
    end({
      method: req.method,
      route: route,
      status_code: res.statusCode,
    });
  });
  next();
};

export default requestDuration;
