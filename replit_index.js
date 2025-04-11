// Replit entry point for GOTC Rally Bot
// Set REPLIT environment flag
process.env.REPLIT = "true";

const keepAlive = require('./keep_alive');
const { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, 
  ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
// Use axios instead of undici for Replit compatibility
const axios = require('axios');
// Provide a fetch polyfill for Replit
global.fetch = async function(url, options = {}) {
  const response = await axios({
    method: options.method || 'GET',
    url: url,
    headers: options.headers || {},
    data: options.body,
    responseType: 'arraybuffer'
  });
  
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    text: async () => response.data.toString(),
    json: async () => JSON.parse(response.data.toString()),
    arrayBuffer: async () => response.data,
  };
};

require('dotenv').config();
const { createServer } = require('http');
const { InteractionType, InteractionResponseType } = require('discord-api-types/v10');
const { verifyKey } = require('discord-interactions');

// Start the keep alive server
keepAlive();

// Import and run the main bot code
require('./index.js');

console.log('Replit bot initialized and keep-alive server started'); 