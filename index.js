// index.js - Main entry point for the Discord.js bot
const { Client, GatewayIntentBits, Partials, Events, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { fetch } = require('undici');
require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { InteractionType, InteractionResponseType } = require('discord-api-types/v10');
const { verifyKey } = require('discord-interactions');

// Create a new client instance
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
],
partials: [Partials.Channel]
});

// Database to store server variables (in a real app, use a proper database)
const serverVars = new Map();

// Helper function to get server variable
function getServerVar(guildId, key, defaultValue = null) {
const guildVars = serverVars.get(guildId) || {};
return guildVars[key] !== undefined ? guildVars[key] : defaultValue;
}

// Helper function to set server variable
function setServerVar(guildId, key, value) {
const guildVars = serverVars.get(guildId) || {};
guildVars[key] = value;
serverVars.set(guildId, guildVars);
return value;
}

// Role configuration
const ROLES = {
ZERO_SQUAD: {
//id: '1359716408811978792',
id: '1360153606061428867',
name: 'Zero Squad'
},
KEEP_HUNTER: {
//id: '1360023628066066533',
id: '1360153907237486763',
name: 'Keep Hunter'
}
};

// Define commands
const commands = [
new SlashCommandBuilder()
.setName('startrollcall')
.setDescription('Start a new roll call for an upcoming rally')
.addStringOption(option => 
  option.setName('target')
    .setDescription('The target for the rally')
    .setRequired(true))
.addStringOption(option => 
  option.setName('power-level')
    .setDescription('The power level of the target')
    .setRequired(true))
.addStringOption(option => 
  option.setName('target-main-troop')
    .setDescription('The main troop type of the target')
    .setRequired(false)),
    
new SlashCommandBuilder()
.setName('endrollcall')
.setDescription('End the current roll call and display results'),

new SlashCommandBuilder()
.setName('inforollcall')
.setDescription('Display the current roll call status without ending it')
];

// Register slash commands when the bot starts
client.once(Events.ClientReady, async () => {
console.log(`Logged in as ${client.user.tag}!`);

try {
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationCommands(client.user.id),
  { body: commands }
);

console.log('Successfully registered application commands.');
} catch (error) {
console.error('Error registering commands:', error);
}
});

// Handle interaction events (slash commands and buttons)
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isCommand()) {
      await handleCommandInteraction(interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        });
      }
    } catch (err) {
      console.error('Error sending error message:', err);
    }
  }
});

// Handle slash command interactions
async function handleCommandInteraction(interaction) {
const { commandName, guildId } = interaction;

if (commandName === 'startrollcall') {
await handleStartRollCall(interaction);
} else if (commandName === 'endrollcall') {
await handleEndRollCall(interaction);
} else if (commandName === 'inforollcall') {
await handleInfoRollCall(interaction);
}
}

// Handle button interactions
async function handleButtonInteraction(interaction) {
const { customId, guildId, user } = interaction;

if (customId === 'availableBtn') {
await handleAvailableButton(interaction);
}
}

// Handle /startrollcall command
async function handleStartRollCall(interaction) {
const { guildId, channelId } = interaction;
const target = interaction.options.getString('target');
const powerLevel = interaction.options.getString('power-level');
const targetMainTroop = interaction.options.getString('target-main-troop');

// Clear previous roll call data
setServerVar(guildId, 'rollcall', []);
setServerVar(guildId, 'rollCallActive', true);
setServerVar(guildId, 'rollCallTarget', target);
setServerVar(guildId, 'rollCallPowerLevel', powerLevel);
setServerVar(guildId, 'rollCallTargetMainTroop', targetMainTroop);

// Create roll call message
const row = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId('availableBtn')
    .setLabel('I\'m Available')
    .setStyle(ButtonStyle.Primary)
);

// Build description text with increased spacing
let descriptionText = `
# 🎯 ${target}


# ⚡ ${powerLevel}`;

if (targetMainTroop) {
  descriptionText += `


# ⚔️ ${targetMainTroop}`;
}

const embed = new EmbedBuilder()
  .setColor(0xFF0000) // Red color for the sidebar
  .setTitle('RALLY CALL INITIATED 🚨')
  .setImage('https://i.ibb.co/N23CRkHc/Rally-Bot-Banner.jpg') 
  .setDescription(descriptionText)
  .addFields(
    { 
      name: '\u200B', 
      value: '---------------------------------------------------' 
    }, // Add horizontal divider
    { 
      name: '📢 ATTENDANCE', 
      value: 'Click the **"I\'m Available"** button below if you can attend this rally.' 
    },
    { 
        name: '\u200B', 
        value: '---------------------------------------------------' 
      },
      {
      name: 'REQUIREMENTS',
      value: '```\n| Role         | Dragon Lvl  | Marcher    |\n|--------------|-------------|------------|\n| Zero Squad   | 56+         | 3.4k+      |\n| Keep Hunter  | Any         | 2.6k+      |\n```' // Add empty field for spacing
      },
   //   name: 'ZERO SQUAD REQUIREMENTS', 
   //   value: '56+ Dragon\n3.4k Marcher or Higher',
   //   inline: true 
   //   },
   // { 
   //   name: 'KEEP HUNTER REQUIREMENTS', 
   //   value: 'Any Dragon level\n2.6k Marcher or Higher',
   //   inline: true 
   //   },
    { 
        name: '\u200B', 
        value: '---------------------------------------------------' 
      }, // Add empty field for spacing
    { 
      name: 'KEY', 
      value: '🎯 = TARGET\u200B ⚡ = POWER LEVEL\u200B ⚔️ = MAIN TROOP' 
    }
  )
  .setFooter({ text: 'Roll call will remain open until an admin runs the `/endrollcall` command.' })
  .setTimestamp();

// Reply with the embed and button
const message = await interaction.reply({
  embeds: [embed],
  components: [row],
  fetchReply: true
});

// Store message and channel info
setServerVar(guildId, 'rollCallMessageID', message.id);
setServerVar(guildId, 'rollCallChannelID', channelId);
}

// Handle /endrollcall command
async function handleEndRollCall(interaction) {
const { guildId, guild } = interaction;
const rollCallActive = getServerVar(guildId, 'rollCallActive', false);

if (!rollCallActive) {
await interaction.reply({
  content: 'There is no active roll call to end.',
  ephemeral: true
});
return;
}

// Get roll call data
const rollCallUsers = getServerVar(guildId, 'rollcall', []);
const rollCallMessageID = getServerVar(guildId, 'rollCallMessageID');
const rollCallChannelID = getServerVar(guildId, 'rollCallChannelID');
const target = getServerVar(guildId, 'rollCallTarget', 'Unknown');
const powerLevel = getServerVar(guildId, 'rollCallPowerLevel', 'Unknown');
const targetMainTroop = getServerVar(guildId, 'rollCallTargetMainTroop', null);

// End the roll call
setServerVar(guildId, 'rollCallActive', false);

// Try to edit the original roll call message
try {
const channel = await guild.channels.fetch(rollCallChannelID);
const message = await channel.messages.fetch(rollCallMessageID);

const embed = new EmbedBuilder()
  .setColor(0xFF0000)
  .setTitle('Roll Call Ended!')
  .setDescription('This roll call has ended. The "I\'m Available" button has been disabled.')
  .setTimestamp();

const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('availableBtn')
      .setLabel('I\'m Available')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true)
  );

await message.edit({
  embeds: [embed],
  components: [row]
});
} catch (error) {
console.error('Error editing the roll call message:', error);
}

// If no one responded to the roll call
if (rollCallUsers.length === 0) {
await interaction.reply({
  content: '*(No one responded to the roll call.)*',
});
return;
}

// Process the roll call results
const qualified = [];
const unqualified = [];

for (const userId of rollCallUsers) {
try {
  const member = await guild.members.fetch(userId);
  
  // Check if user has any of the required roles
  const hasZeroSquad = member.roles.cache.has(ROLES.ZERO_SQUAD.id);
  const hasKeepHunter = member.roles.cache.has(ROLES.KEEP_HUNTER.id);
  
  if (hasZeroSquad || hasKeepHunter) {
    let roleText = '';
    if (hasZeroSquad) roleText += ` ${ROLES.ZERO_SQUAD.name}`;
    if (hasKeepHunter) roleText += ` ${ROLES.KEEP_HUNTER.name}`;
    
    qualified.push(`- <@${userId}> -${roleText}`);
  } else {
    unqualified.push(`- <@${userId}> - Not qualified`);
  }
} catch (error) {
  console.error(`Error processing user ${userId}:`, error);
  unqualified.push(`- <@${userId}> - Error processing user`);
}
}

// Create results embed
const resultsEmbed = new EmbedBuilder()
.setColor(0x00FF00)
.setTitle('📋 Roll Call Results')
.setDescription(`Results as of <t:${Math.floor(Date.now() / 1000)}:F>\n\n# Rally Details\n\n**🎯 Target:**\n# ${target}\n\n**⚡ Power Level:**\n# ${powerLevel}${targetMainTroop ? `\n\n**⚔️ Main Troop:**\n# ${targetMainTroop}` : ''}`)
.addFields(
  { name: '✅ Qualified Members', value: qualified.length > 0 ? qualified.join('\n') : 'None', inline: false },
  { name: 'ℹ️', value: 'Members in this list will be utilized in the rally per their role.', inline: false },
  { name: '❌ Not Qualified', value: unqualified.length > 0 ? unqualified.join('\n') : 'None', inline: false },
  { name: 'ℹ️', value: 'Members in this list will **not** be utilized in the rally, due to having no qualifying role.', inline: false }
)
.setTimestamp();

// Send the results
await interaction.reply({
embeds: [resultsEmbed]
});
}

// Handle /inforollcall command
async function handleInfoRollCall(interaction) {
const { guildId, guild } = interaction;
const rollCallActive = getServerVar(guildId, 'rollCallActive', false);

if (!rollCallActive) {
await interaction.reply({
  content: 'There is no active roll call at the moment.',
  ephemeral: true
});
return;
}

// Get roll call data
const rollCallUsers = getServerVar(guildId, 'rollcall', []);
const target = getServerVar(guildId, 'rollCallTarget', 'Unknown');
const powerLevel = getServerVar(guildId, 'rollCallPowerLevel', 'Unknown');
const targetMainTroop = getServerVar(guildId, 'rollCallTargetMainTroop', null);

// If no one has responded yet
if (rollCallUsers.length === 0) {
await interaction.reply({
  content: 'Roll call is active, but no one has responded yet.',
  ephemeral: true
});
return;
}

// Process the roll call results
const qualified = [];
const unqualified = [];

for (const userId of rollCallUsers) {
try {
  const member = await guild.members.fetch(userId);
  
  // Check if user has any of the required roles
  const hasZeroSquad = member.roles.cache.has(ROLES.ZERO_SQUAD.id);
  const hasKeepHunter = member.roles.cache.has(ROLES.KEEP_HUNTER.id);
  
  if (hasZeroSquad || hasKeepHunter) {
    let roleText = '';
    if (hasZeroSquad) roleText += ` ${ROLES.ZERO_SQUAD.name}`;
    if (hasKeepHunter) roleText += ` ${ROLES.KEEP_HUNTER.name}`;
    
    qualified.push(`- <@${userId}> -${roleText}`);
  } else {
    unqualified.push(`- <@${userId}> - Not qualified`);
  }
} catch (error) {
  console.error(`Error processing user ${userId}:`, error);
  unqualified.push(`- <@${userId}> - Error processing user`);
}
}

// Create status embed
const statusEmbed = new EmbedBuilder()
.setColor(0x0099FF)
.setTitle('📋 Current Roll Call Status')
.setDescription(`Status as of <t:${Math.floor(Date.now() / 1000)}:F>\n\n# Rally Details\n\n**🎯 Target:**\n# ${target}\n\n**⚡ Power Level:**\n# ${powerLevel}${targetMainTroop ? `\n\n**⚔️ Main Troop:**\n# ${targetMainTroop}` : ''}`)
.addFields(
  { name: '✅ Qualified Members so far', value: qualified.length > 0 ? qualified.join('\n') : 'None', inline: false },
  { name: 'ℹ️', value: 'Members in this list will be utilized in the rally per their role.', inline: false },
  { name: '❌ Not Qualified', value: unqualified.length > 0 ? unqualified.join('\n') : 'None', inline: false },
  { name: 'ℹ️', value: 'Members in this list will **not** be utilized in the rally, due to having no qualifying role.', inline: false }
)
.setFooter({ text: 'Roll call is still in progress. More members can join by clicking the button on the original roll call message.' })
.setTimestamp();

// Send the status
await interaction.reply({
embeds: [statusEmbed],
ephemeral: true
});
}

// Handle "I'm Available" button click
async function handleAvailableButton(interaction) {
const { guildId, user, guild } = interaction;
const rollCallActive = getServerVar(guildId, 'rollCallActive', false);

if (!rollCallActive) {
await interaction.reply({
  content: 'This roll call has ended and is no longer accepting responses.',
  ephemeral: true
});
return;
}

// Get current roll call list
const rollCallUsers = getServerVar(guildId, 'rollcall', []);

// Check if user has already responded
if (rollCallUsers.includes(user.id)) {
await interaction.reply({
  content: 'You\'ve already marked yourself as available for this roll call.',
  ephemeral: true
});
return;
}

// Add user to roll call list
rollCallUsers.push(user.id);
setServerVar(guildId, 'rollcall', rollCallUsers);

// Get member info
const member = await guild.members.fetch(user.id);

// Check if user has any of the required roles
const hasZeroSquad = member.roles.cache.has(ROLES.ZERO_SQUAD.id);
const hasKeepHunter = member.roles.cache.has(ROLES.KEEP_HUNTER.id);

// Create response embed
const responseEmbed = new EmbedBuilder()
.setColor(hasZeroSquad || hasKeepHunter ? 0x00FF00 : 0xFF0000)
.setTitle(`@${user.username} is here!`)
.setTimestamp();

if (hasZeroSquad || hasKeepHunter) {
let roleText = '';
if (hasZeroSquad) roleText += ` ${ROLES.ZERO_SQUAD.name}`;
if (hasKeepHunter) roleText += ` ${ROLES.KEEP_HUNTER.name}`;

responseEmbed.setDescription(`You have been added to the roll call. You are qualified for the rally with the following role(s):${roleText}`);
} else {
responseEmbed.setDescription('You have been added to the roll call, but you are **not qualified** for the rally as you don\'t have any of the required roles.');
}

// Create a disabled button for this user only
const disabledRow = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId('availableBtn')
    .setLabel('Response Recorded ✓')
    .setStyle(ButtonStyle.Success)
    .setDisabled(true)
);

// Update the message for this user only
await interaction.update({
  components: [disabledRow]
});

// Send additional information as ephemeral message
await interaction.followUp({
embeds: [responseEmbed],
ephemeral: true
});
}

// Optional: Set up an Express server for handling Discord interactions via webhook
// This is useful if you want to use Discord's Interactions Endpoint URL feature
// You can remove this if you're only using the client-based approach above
function setupExpressServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

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
  app.post('/interactions', (req, res) => {
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
        
        // Acknowledge the interaction with a deferred response
        // The actual handling happens through the Discord.js client
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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

// Determine if Express server should be set up
// You can enable this by setting USE_EXPRESS=true in your .env
if (process.env.USE_EXPRESS === 'true') {
  setupExpressServer();
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('Discord bot logged in successfully'))
  .catch(err => console.error('Error logging in to Discord:', err));