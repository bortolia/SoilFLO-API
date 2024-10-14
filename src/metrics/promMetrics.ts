import promClient from "prom-client";

export const httpRequestDurationMilliseconds = new promClient.Histogram({
  name: "httprequest_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.0001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1.0],
});
