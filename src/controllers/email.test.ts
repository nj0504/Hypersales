import { Request, Response, NextFunction } from 'express';
import { generateEmail } from './email';
import { AppError } from '../middleware/errorHandler';

jest.mock('openrouter', () => ({
  OpenRouter: jest.fn().mockImplementation(() => ({
    createCompletion: jest.fn().mockResolvedValue({
      choices: [{ text: 'Generated email content' }]
    })
  }))
}));

describe('Email Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {
        recipient: {
          name: 'John Doe',
          company: 'Acme Inc',
          role: 'CTO'
        },
        context: {
          product: 'AI Sales Assistant',
          valueProposition: 'Increase sales efficiency by 200%'
        }
      }
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  it('should generate an email successfully', async () => {
    await generateEmail(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        email: 'Generated email content'
      }
    });
  });

  it('should handle missing recipient information', async () => {
    mockRequest.body = {
      context: {
        product: 'AI Sales Assistant',
        valueProposition: 'Increase sales efficiency by 200%'
      }
    };

    await generateEmail(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Recipient information is required'
      })
    );
  });

  it('should handle missing context information', async () => {
    mockRequest.body = {
      recipient: {
        name: 'John Doe',
        company: 'Acme Inc',
        role: 'CTO'
      }
    };

    await generateEmail(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Email context is required'
      })
    );
  });

  it('should handle API errors', async () => {
    const mockError = new Error('API Error');
    const OpenRouter = require('openrouter').OpenRouter;
    OpenRouter.mockImplementation(() => ({
      createCompletion: jest.fn().mockRejectedValue(mockError)
    }));

    await generateEmail(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(mockError);
  });
}); 