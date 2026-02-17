
import { TransactionType } from '@prisma/client';
import prisma from '../config/db';

export const WalletService = {
    /**
     * Get user's current coin balance
     */
    async getBalance(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { coinsBalance: true },
        });
        return user?.coinsBalance || 0;
    },

    /**
     * Add coins to user's wallet (e.g. effective payment or reward)
     */
    async deposit(userId: string, amount: number, description: string = 'Deposit') {
        if (amount <= 0) throw new Error("Amount must be positive");

        return prisma.$transaction(async (tx) => {
            // Update User Balance
            const user = await tx.user.update({
                where: { id: userId },
                data: { coinsBalance: { increment: amount } },
            });

            // Log Transaction
            await tx.coinTransaction.create({
                data: {
                    userId,
                    amount,
                    type: TransactionType.DEPOSIT,
                    description,
                },
            });

            return user.coinsBalance;
        });
    },

    /**
     * Deduct coins from user's wallet (e.g. purchase)
     */
    async withdraw(userId: string, amount: number, description: string = 'Purchase') {
        if (amount <= 0) throw new Error("Amount must be positive");

        return prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.coinsBalance < amount) {
                throw new Error("Insufficient funds");
            }

            // Update User Balance
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { coinsBalance: { decrement: amount } },
            });

            // Log Transaction
            await tx.coinTransaction.create({
                data: {
                    userId,
                    amount: -amount, // Negative for withdrawal
                    type: TransactionType.PURCHASE,
                    description,
                },
            });

            return updatedUser.coinsBalance;
        });
    }
};
