import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateRefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
  async create(data: CreateRefreshTokenData) {
    return await prisma.refreshToken.create({
      data,
    });
  }

  async findByToken(token: string) {
    return await prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async delete(id: string) {
    return await prisma.refreshToken.delete({
      where: { id },
    });
  }

  async deleteByToken(token: string) {
    return await prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteExpired() {
    return await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
