import { Client, GatewayIntentBits, Events, TextChannel } from 'discord.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const url = 'https://repo.protonvpn.com/fedora-42-unstable/';
const stateFilePath = './state.json';
const checkIntervalHours = 1;

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;

if (!token) {
    console.error('Error: DISCORD_TOKEN environment variable not set.');
    process.exit(1);
}
if (!channelId) {
    console.error('Error: CHANNEL_ID environment variable not set.');
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function loadState() {
    if (existsSync(stateFilePath)) {
        try {
            const data = readFileSync(stateFilePath, 'utf-8');
            if (!data) {
                console.warn('State file is empty, returning empty state.');
                return {};
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading or parsing state file:', error);
            return {};
        }
    }
    return {};
}

function saveState(state) {
    try {
        writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Error writing state file:', error);
    }
}

function parseHtml(html) {
    const entries = {};
    const regex = /<a href="([^"]+)">.*?<\/a>\s+([\d]{2}-[A-Za-z]{3}-[\d]{4} [\d]{2}:[\d]{2})/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        if (match[1] === '../') continue;
        const name = match[1].replace(/\/$/, '');
        const timestamp = match[2];
        entries[name] = timestamp;
    }
    console.log('Parsed Entries:', JSON.stringify(entries));
    return entries;
}

async function checkForUpdates() {
    console.log('Checking for updates...');
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching URL: ${response.status} ${response.statusText}`);
            return;
        }
        const html = await response.text();
        const currentState = parseHtml(html);
        const previousState = loadState();

        console.log('Previous State:', JSON.stringify(previousState));
        console.log('Current State:', JSON.stringify(currentState));

        const changes = [];
        const allKeys = new Set([...Object.keys(previousState), ...Object.keys(currentState)]);

        for (const key of allKeys) {
            const inPrevious = previousState.hasOwnProperty(key);
            const inCurrent = currentState.hasOwnProperty(key);

            if (inCurrent && !inPrevious) {
                changes.push(`🆕 Added: \`${key}\` (${currentState[key]})`);
            } else if (!inCurrent && inPrevious) {
                changes.push(`🗑️ Deleted: \`${key}\` (${previousState[key]})`);
            } else if (inCurrent && inPrevious && previousState[key] !== currentState[key]) {
                changes.push(`🔄 Updated: \`${key}\` (${previousState[key]} -> ${currentState[key]})`);
            }
        }

        console.log(`Detected ${changes.length} changes.`);

        if (changes.length > 0) {
            console.log('Changes detected:', changes);

            const channel = await client.channels.fetch(channelId);
            if (channel instanceof TextChannel) {
                let message = `🚨 Updates detected on ${url} 🚨\n\n` + changes.join('\n');
                const maxLength = 1900;
                if (message.length > maxLength) {
                     const chunks = [];
                     while (message.length > 0) {
                         chunks.push(message.substring(0, maxLength));
                         message = message.substring(maxLength);
                     }
                     for (const chunk of chunks) {
                         await channel.send(chunk);
                     }
                } else {
                     await channel.send(message);
                }
            } else {
                console.error(`Error: Channel ${channelId} not found or is not a text channel.`);
            }
        } else {
            console.log('No changes detected.');
        }
        
        saveState(currentState); 

    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    checkForUpdates();
    setInterval(checkForUpdates, checkIntervalHours * 60 * 60 * 1000);
});

client.login(token);

console.log('Bot starting...');