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

/**
 * Creates a new transaction in the PostgreSQL database.
 */
export async function createTransaction(
    amount: number,
    description: string,
    category: string,
    type: string
) {
    return await prisma.transaction.create({
        data: {
            amount,
            description,
            category,
            type,
        },
    });
}