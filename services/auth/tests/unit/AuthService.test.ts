import { AuthService } from '../../src/services/AuthService';
import { UserRepository } from '../../src/repositories/UserRepository';
import { RefreshTokenRepository } from '../../src/repositories/RefreshTokenRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../src/repositories/UserRepository');
jest.mock('../../src/repositories/RefreshTokenRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockRefreshTokenRepository = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
    authService = new AuthService(mockUserRepository, mockRefreshTokenRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        name: userData.name,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      // Act
      const result = await authService.signup(userData.email, userData.password, userData.name);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        name: userData.name,
        password: 'hashedPassword'
      });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: userData.email,
        name: userData.name,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act & Assert
      await expect(
        authService.signup(userData.email, userData.password, userData.name)
      ).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: '1',
        email: credentials.email,
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      // Act
      const result = await authService.login(credentials.email, credentials.password);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(credentials.email);
    });

    it('should throw error with invalid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login(credentials.email, credentials.password)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with incorrect password', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: '1',
        email: credentials.email,
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        authService.login(credentials.email, credentials.password)
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const refreshTokenValue = 'validRefreshToken';
      const mockRefreshToken = {
        id: '1',
        token: refreshTokenValue,
        userId: '1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockRefreshToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('newMockToken');

      // Act
      const result = await authService.refreshToken(refreshTokenValue);

      // Assert
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(refreshTokenValue);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockRefreshToken.userId);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error with invalid refresh token', async () => {
      // Arrange
      const refreshTokenValue = 'invalidRefreshToken';
      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.refreshToken(refreshTokenValue)
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error with expired refresh token', async () => {
      // Arrange
      const refreshTokenValue = 'expiredRefreshToken';
      const mockRefreshToken = {
        id: '1',
        token: refreshTokenValue,
        userId: '1',
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockRefreshToken);

      // Act & Assert
      await expect(
        authService.refreshToken(refreshTokenValue)
      ).rejects.toThrow('Refresh token expired');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const refreshTokenValue = 'validRefreshToken';
      mockRefreshTokenRepository.deleteByToken.mockResolvedValue(undefined);

      // Act
      await authService.logout(refreshTokenValue);

      // Assert
      expect(mockRefreshTokenRepository.deleteByToken).toHaveBeenCalledWith(refreshTokenValue);
    });
  });
});
