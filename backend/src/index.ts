import "dotenv/config";
import './config/passport.config'
import express,{NextFunction,Request,Response} from "express";
import { Env } from "./config/env.config";
import cors from "cors";
import {calculateNextReportDate} from "./utils/helper";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import passport from "passport";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
const app = express();
import { BadRequestException } from "./utils/app-error";
import {connectDatabase} from "./config/database.config";
import authRoutes from "./routes/auth.route";
import { passportAuthenticateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.routes";
import transactionRoutes from "./routes/transaction.route";
import { initializeCrons } from "./crons";
import reportRoutes from "./routes/report.route";
const BASE_PATH=Env.BASE_PATH
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:Env.FRONTEND_ORIGIN,
    credentials:true
}
));
app.use(passport.initialize());
app.use(express.json());
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.error) {
      return next(new BadRequestException("Forced error for testing 🚨"));
    }

    res.status(HTTPSTATUS.OK).json({
      message: "Hello! Subscribe to the channel 🚀",
    });
  })
);
calculateNextReportDate()
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt,userRoutes )
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt,transactionRoutes )
app.use(`${BASE_PATH}/reports`, passportAuthenticateJwt,reportRoutes )
  app.use(errorHandler);

(async () => {
  try {
    await connectDatabase();
    if(Env.NODE_ENV==='development'){
    await initializeCrons()
    }
    app.listen(Env.PORT, () => {
      
      console.log(`Auth routes available at: http://localhost:${Env.PORT}${BASE_PATH}/auth`);
      console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);

    })
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

export default app;







