const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { InteractionType, InteractionResponseType } = require('discord-api-types/v10');
const { verifyKey } = require('discord-interactions');
const { fetch } = require('undici');

// Configure middleware
app.use(express.json({ verify: (req, res, buf) => {
  // Store the raw buffer for signature verification
  req.rawBody = buf;
}}));

// Home route
app.get('/', (req, res) => {
  res.send('Discord bot is running!');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Discord interactions endpoint
app.post('/', (req, res) => {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  
  try {
    // Verify the request if we have a signature and timestamp
    if (signature && timestamp && req.rawBody) {
      const isValidRequest = verifyKey(
        req.rawBody,
        signature,
        timestamp,
        process.env.DISCORD_PUBLIC_KEY
      );
      
      if (!isValidRequest) {
        res.status(401).send('Invalid signature');
        return;
      }
      
      // Parse the interaction (already parsed by express.json middleware)
      const interaction = req.body;
      
      // Handle verification requests (ping)
      if (interaction.type === InteractionType.Ping) {
        console.log('Received ping from Discord - responding with pong');
        res.setHeader('Content-Type', 'application/json');
        res.send({ type: InteractionResponseType.Pong });
        return;
      }
      
      // Forward other interactions to the index.js handlers
      // They will be handled by the Discord.js event listeners
      console.log(`Forwarding interaction type ${interaction.type} to Discord.js client`);
      
      // Acknowledge the interaction with a deferred response
      res.setHeader('Content-Type', 'application/json');
      res.send({ 
        type: InteractionResponseType.DeferredChannelMessageWithSource 
      });
    } else {
      res.status(400).send('Missing signature, timestamp headers or request body');
    }
  } catch (error) {
    console.error('Error handling Discord interaction:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
function keepAlive() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Keep-alive server running on port ${PORT}`);
  });
}

module.exports = keepAlive; 