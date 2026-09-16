import { Request, Response } from "express";
import {
  createExpense,
  getExpenses,
} from "../services/expense.service";

export async function getExpenseController(
  req: Request,
  res: Response
) {
  const data = await getExpenses();

  res.json({
    success: true,
    data,
  });
}

export async function createExpenseController(
  req: Request,
  res: Response
) {
  const expense = await createExpense(req.body);

  res.json({
    success: true,
    data: expense,
  });
}