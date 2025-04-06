import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { OpenRouter } from 'openrouter';

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

export const generateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { recipient, context } = req.body;

    const prompt = `Generate a personalized sales email for ${recipient.name} at ${recipient.company}, who is a ${recipient.role}. 
    The email should focus on our product: ${context.product}, and highlight the following value proposition: ${context.valueProposition}.
    Make the email professional, concise, and personalized to their role and company.`;

    const response = await openrouter.createCompletion({
      model: 'openai/gpt-3.5-turbo',
      prompt,
      max_tokens: 500,
      temperature: 0.7
    });

    if (!response.choices?.[0]?.text) {
      throw new AppError(500, 'Failed to generate email');
    }

    const generatedEmail = response.choices[0].text.trim();

    logger.info({
      message: 'Email generated successfully',
      recipient: recipient.name,
      company: recipient.company
    });

    res.json({
      status: 'success',
      data: {
        email: generatedEmail
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error generating email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    next(error);
  }
}; 