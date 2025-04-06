# AI Email Generator

A web application for generating personalized emails using the OpenRouter Qwen2.5 model.

## Environment Variables

This application requires an OpenRouter API key to function.

**Important:** Before running the application locally, you must set the OPENROUTER_API_KEY environment variable.

Create a .env file in the project root with:
OPENROUTER_API_KEY=your-api-key-here

## Troubleshooting

- If you see an error about "OPENROUTER_API_KEY environment variable is not set", make sure you've created the .env file with your API key.
- If emails aren't generating correctly, ensure the CSV file has the proper format with NAME and COMPANY NAME columns filled in.
