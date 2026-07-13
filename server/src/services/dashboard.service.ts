/**
 * This file contains the service functions for the dashboard, which handle the business logic related to fetching and processing data for the dashboard view.
 * 
 * 
 */ 

import prisma from "../lib/prisma.js";

export async function dashboardSummary() {
  const transactions = await prisma.transaction.findMany({
    select: {
      amount: true,
      type: true,
    },
  });

  const income = transactions
    .filter((transaction) => transaction.type.toLowerCase() === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type.toLowerCase() === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
  };
}