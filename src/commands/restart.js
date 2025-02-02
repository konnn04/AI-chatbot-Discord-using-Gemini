const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout; //Timeout
const {createChatSession } = require("../plugin/ai_chat");


module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
		.setName('reset_chat')
		.setDescription('Khởi động lại session chat AI. Chú ý: Dữ liệu cũ sẽ bị mất!'),
	async execute(interaction) {
        const guildId = interaction.guild.id;
        try {
            await createChatSession(guildId);
            await wait(1000);
            await interaction.reply({ content: 'Khởi động lại session chat AI thành công!', ephemeral: true });
        } catch (error) {
            console.log(error);
            await interaction.reply({ content: 'Khởi động lại session chat AI thất bại!', ephemeral: true });
        }
    }
};