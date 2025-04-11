// Replit entry point for GOTC Rally Bot
// Set REPLIT environment flag
process.env.REPLIT = "true";

const keepAlive = require('./keep_alive');
const { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, 
  ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { fetch } = require('undici');
require('dotenv').config();
const { createServer } = require('http');
const { InteractionType, InteractionResponseType } = require('discord-api-types/v10');
const { verifyKey } = require('discord-interactions');

// Start the keep alive server
keepAlive();

// Import and run the main bot code
require('./index.js');

console.log('Replit bot initialized and keep-alive server started'); 