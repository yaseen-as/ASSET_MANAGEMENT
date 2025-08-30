import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateHoldingData {
  userId: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
  category: 'SWING' | 'LONG_TERM';
}

export class HoldingRepository {
  async create(data: CreateHoldingData) {
    return await prisma.holding.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return await prisma.holding.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return await prisma.holding.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<CreateHoldingData>) {
    return await prisma.holding.update({
      where: { id },
      data,
    });
  }

  async updatePrice(id: string, currentPrice: number) {
    return await prisma.holding.update({
      where: { id },
      data: { currentPrice },
    });
  }

  async delete(id: string) {
    return await prisma.holding.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string) {
    return await prisma.holding.deleteMany({
      where: { userId },
    });
  }
}
