import prisma from "../lib/prisma.js";

/**
 * Retrieves all transactions from the PostgreSQL database.
 * Transactions are returned with the most recently created first.
 */



export async function getRecentTransactions() {
    return await prisma.transaction.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}

type CreateTransactionData = {
    amount: number;
    description: string;
    category: string;
    type: string;
};

/**
 * Creates a new transaction in the PostgreSQL database.
 */
export async function createTransaction(data: CreateTransactionData) {
    return await prisma.transaction.create({
        data: {
            amount: data.amount,
            description: data.description,
            category: data.category,
            type: data.type,
        },
    });
}

/**
 * Deletes a transaction from the PostgreSQL database.
 */
export async function deleteTransaction(id: number) {
  return await prisma.transaction.delete({
    where: {
      id,
    },
  });
}