import dayjs from "dayjs";
import pino from "pino";
import pretty from "pino-pretty";

/**
 * log.levelType({params?}, message)
 */
const log = pino(
  pretty({
    ignore: "pid,hostname",
    customPrettifiers: {
      time: () => dayjs().format(),
    },
  })
);

export default log;
