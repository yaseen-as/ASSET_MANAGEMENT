import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import ApiError from '../utils/ApiError';

export interface SignupData {
  email: string;
  name: string;
  password: string;
  angelOneApiKey?: string;
  angelOneClientId?: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  async signup(data: SignupData): Promise<LoginResult> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const tokenRecord = await this.refreshTokenRepository.findByToken(refreshToken);
    
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Generate new tokens
    const newToken = this.generateAccessToken(tokenRecord.userId);
    const newRefreshToken = await this.generateRefreshToken(tokenRecord.userId);

    // Delete old refresh token
    await this.refreshTokenRepository.delete(tokenRecord.id);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  private generateAccessToken(userId: string): string {
    if (!process.env.JWT_SECRET) {
      throw ApiError.internal('JWT secret not configured');
    }

    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw ApiError.internal('JWT refresh secret not configured');
    }

    const token = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    return token;
  }
}
