import { Request, Response } from "express";
import { getDashboard } from "../services/dashboard.service";

export async function dashboardController(
req:Request,
res:Response
){

const data=await getDashboard();

res.json({
success:true,
data,
});

}