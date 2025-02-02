const { Client, Events, GatewayIntentBits, IntentsBitField, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const port = 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessagePolls,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMessageReactions,
  ]
});

// client.on(Events.InteractionCreate, async interaction => {
//   if (!interaction.isChatInputCommand()) return;

//   if (interaction.commandName === 'ping') {
//     await interaction.reply('Pong!');
//   }
// });

// Tạo một collection để lưu các event
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, async (...args) => await event.execute(...args));
  } else {
    client.on(event.name, async (...args) => await event.execute(...args));
  }
}

// Tạo một collection để lưu các command
client.commands = new Collection();
client.cooldowns = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) { 
    client.commands.set(command.data.name, command); 
  } else {
    console.log(`[WARNING] Lệnh ${filePath} bị thiếu "data" hay "execute" gì đó đéo biết.`);
  }
}




app.get('/', (req, res) => {
  res.send();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

client.login(process.env['TOKEN_BOT']);

