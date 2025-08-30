import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  angelOneApiKey?: string;
  angelOneClientId?: string;
}

export class UserRepository {
  async create(data: CreateUserData) {
    return await prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async updateAngelOneCredentials(id: string, apiKey: string, clientId: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        angelOneApiKey: apiKey,
        angelOneClientId: clientId,
      },
    });
  }
}
