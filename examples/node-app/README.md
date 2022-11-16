# `node-app`

## Usage
Create a `.env` file. You can copy the example and use it as a template.
```
cp .env.example .env
```

Run the example with
```
yarn start
```

Notice you will need to set required API Keys in your `.env`
```
AMP_ANALYTICS_API_KEY=your-analytics-api-key
AMP_EXPERIMENT_API_KEY=your-experiment-deployment-key
```

## Individual examples (Cross platform)
* [src/app.ts](src/app.ts) - Simple Node app, No frameworks
* [src/server.ts](src/server.ts) - Express server with middleware usage
