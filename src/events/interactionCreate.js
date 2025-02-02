const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`Không thấy ${interaction.commandName} trong ngăn tủ tầng hầm.`);
			return;
		}

		const cooldowns = interaction.client.cooldowns;
		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}
		
		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
		
		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
		
			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				return interaction.reply({ content: `Đang cooldown... <t:${expiredTimestamp}:R>.`, ephemeral: true });
			}
		}
		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		// Thực thi lệnh
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Lỗi thực thi ${interaction.commandName}`);
			console.error(error);
		}
    }
}

