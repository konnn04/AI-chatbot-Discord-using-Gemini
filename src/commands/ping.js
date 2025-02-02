const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout; //Timeout
const {createChatSession } = require("../plugin/ai_chat");


module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping pong!'),
	async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! Latency is ${latency}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms.`);
    }
};