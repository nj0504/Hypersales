# Hypersales

An AI-powered email generation tool for sales outreach.

## Features
- Generate personalized sales emails using AI
- CSV lead import/export
- Customizable email templates
- Real-time email preview and editing

## Local Development
1. Clone the repository
```bash
git clone https://github.com/nj0504/Hypersales.git
cd Hypersales
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with:
```env
OPENROUTER_API_KEY=your_api_key
```

4. Run the development server
```bash
npm run dev
```

## Deployment
The application is deployed on Railway.app. To deploy:

1. Install Railway CLI
```bash
npm i -g @railway/cli
```

2. Login to Railway
```bash
railway login
```

3. Link your project
```bash
railway link
```

4. Deploy
```bash
railway up
```

## Environment Variables
Required environment variables:
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `NODE_ENV`: Set to "production" in production

## Usage
1. Fill in your sender information
2. Upload your leads CSV file
3. Configure email settings
4. Generate personalized emails
5. Preview and edit generated emails
6. Export final emails to CSV

## Contributing
Pull requests are welcome. For major changes, please open an issue first.

## License
MIT
