const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,	
	async execute(readyClient) {
        console.log(`Logged in as ${readyClient.user.tag}!`);
        
        readyClient.user.setPresence({
            activities:[{
            name: `Zzz`,type: ActivityType.Listening
            }],
            status:"idle"
        })	
    }
}


// let a = Array.from(document.querySelectorAll("table tr td:nth-child(2)"))
// let s = ""
// a.forEach((e,i)=>{
//     if (e.querySelector("p:nth-child(1)")?.textContent.trim().length>1)
//     s+=(
//         e.querySelector("p:nth-child(1)")?.textContent.replace(/\s+/g, ' ').trim()+ ", "+e.querySelector("p:nth-child(2)")?.textContent.replace(/\s+/g, ' ').trim()+ ", "+e.querySelector("p:nth-child(3)")?.textContent.replace(/\s+/g, ' ').trim()+ ", "+e.querySelector("p:nth-child(4)")?.textContent.replace(/\s+/g, ' ').trim() + ". "
//     )
// })

// console.log(s)