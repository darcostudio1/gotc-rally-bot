# GOTC Rally Bot

A Discord bot for creating roll calls to rally for Game of Thrones: Conquest.

## Features

- Start roll calls with `/startrollcall` command
- Track available players with the "I'm Available" button
- End roll calls and see who's available with `/endrollcall`
- Check roll call status without ending it using `/inforollcall`
- Role-based qualification for rallies

## Setup and Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or higher)
- A Discord bot application set up in the [Discord Developer Portal](https://discord.com/developers/applications)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/gotc-rally-bot.git
   cd gotc-rally-bot
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure Environment Variables
   - Create a `.env` file in the project root
   - Add the following variables:
     ```
     DISCORD_TOKEN=your_discord_bot_token
     DISCORD_PUBLIC_KEY=your_discord_application_public_key
     DISCORD_APPLICATION_ID=your_discord_application_id
     USE_EXPRESS=false
     ```
   - Set `USE_EXPRESS=true` if you want to enable the Express server for webhook interactions

### Running the Bot

#### Development
```bash
npm run dev
```

#### Production
```bash
npm start
```

## Discord Bot Configuration

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to the "Bot" tab and enable all "Privileged Gateway Intents"
4. For slash commands:
   - Go to the "OAuth2" > "URL Generator" tab
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Embed Links`, etc.
   - Use the generated URL to add the bot to your server

## Node.js Version Management

This project requires Node.js v20.x or higher. You can use nvm (Node Version Manager) to easily switch between Node.js versions:

```bash
# Install the correct Node.js version
nvm install 20

# Use the correct Node.js version
nvm use 20
```

## Customization

You can customize the role requirements in the `index.js` file by modifying the `ROLES` object:

```javascript
const ROLES = {
  ZERO_SQUAD: {
    id: 'your-role-id-here',
    name: 'Zero Squad'
  },
  KEEP_HUNTER: {
    id: 'your-role-id-here',
    name: 'Keep Hunter'
  }
};
```

## License

This project is for private use for GOTC rallies. 