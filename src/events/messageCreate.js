const { Client, Events, Collection } = require('discord.js');
const {aiChat, addRecentMessage, addRecentAttachments } = require("../plugin/ai_chat");

module.exports = {
	name: Events.MessageCreate,	
	async execute(message) {
		if (message.author.bot) return;
		const myTagName = `<@${message.client.user.id}>`;
		console.log(message.content);
		const messageContent = message.content.trim();

		const promtMessage = processMessage(message)
		const name = message.member.displayName;
		const channel = message.guild.name + ' | ' + message.channel.name;

		if (messageContent.length > 0) {
			addRecentMessage(messageContent, name, channel , 'user');
		}
		// Lấy mảng các attachment từ message gần nhất
		// console.log(message.attachments);
		const attachments = Array.from(message.attachments.values());
		// Nếu có attachment thì lưu vào mảng recentMessages
		if (attachments.length > 0) {
			addRecentAttachments(attachments, name, channel);
			console.log(`Recieved ${attachments.length} attachments`);
		}

		if (messageContent.includes(myTagName) && messageContent.length > myTagName.length) {
			aiChat(promtMessage, name, channel).then((result) => {
				for (let i = 0; i < result.contents.length; i++) {
					if (i === 0) {
						message.reply(result.contents[i]);
					}else{
						message.channel.send(result.contents[i]);
					}
				}
			}).catch((error) => {
				console.log(error);
			});
		}
    }
}

function processMessage(message) {
	let content = message.content;
	const userMentions = message.mentions.users;
	userMentions.forEach(user => {
		const mentionTag = `<@${user.id}>`;
		const userDisplayName = message.guild.members.cache.get(user.id).displayName;
		content = content.replace(new RegExp(mentionTag, 'g'), userDisplayName);
	});
	return content;
}

