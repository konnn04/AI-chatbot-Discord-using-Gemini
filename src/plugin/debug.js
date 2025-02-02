
function sendDebug(client, message) {
    const guild_id = process.env.DEBUG_GUILD_ID;
    const channel_id = process.env.DEBUG_CHANNEL_ID;    
    const guild = client.guilds.cache.get(guild_id);
    const channel = guild.channels.cache.get(channel_id);
    channel.send(message+'\n'+new Date().toLocaleString());
}

module.exports = {
    sendDebug
}