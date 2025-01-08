const { Client, Events, GatewayIntentBits, IntentsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

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

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, async(...args) => await event.execute(...args));
  } else {
    client.on(event.name, async(...args) => await event.execute(...args));
  }
}



client.login(process.env['TOKEN_BOT']);