import { Router } from "express";
import {
  
  createTransactionController,
 
} from "../controllers/transaction.controller";


const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);





export default transactionRoutes;