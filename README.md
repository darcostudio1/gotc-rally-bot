# GOTC Rally Bot

A Discord bot for creating roll calls to rally for GOTC (Game of Thrones: Conquest).

## Features

- Start roll calls with `/startrollcall` command
- Track available players with the "I'm Available" button
- End roll calls and see who's available with `/endrollcall`
- Check roll call status without ending it using `/inforollcall`

## Deployment on Replit

### 1. Create a New Replit

- Go to [Replit](https://replit.com/)
- Create a new Repl and select "Import from GitHub" or upload the files manually
- Make sure Node.js is selected as the language

### 2. Set Environment Variables

In the Replit interface:
1. Click on the lock icon in the sidebar (Secrets/Environment Variables)
2. Add the following environment variables:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `DISCORD_PUBLIC_KEY`: Your Discord application public key 
   - `DISCORD_APPLICATION_ID`: Your Discord application ID

### 3. Deploy

1. Click the "Run" button to start your bot
2. The `replit_index.js` file will start both the Discord bot and a keep-alive web server
3. Replit will provide you with a URL that looks like: `https://your-repl-name.your-username.repl.co`

### 4. Configure Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to the "General Information" tab
4. In "Interactions Endpoint URL", enter: `https://your-repl-name.your-username.repl.co`
5. Click "Save Changes"

### 5. Keep the Bot Online (24/7)

The project includes a `keep_alive.js` file that runs a simple web server. To keep your bot online 24/7:

1. Create an account on [UptimeRobot](https://uptimerobot.com/)
2. Add a new monitor of type "HTTP(s)"
3. Enter your Replit URL: `https://your-repl-name.your-username.repl.co`
4. Set the monitoring interval to 5 minutes
5. Save the monitor

## Local Development

1. Clone the repository
2. Create a `.env` file with the environment variables
3. Run `npm install`
4. Run `npm run dev` to start the bot in development mode

## License

This project is for private use for GOTC rallies. 