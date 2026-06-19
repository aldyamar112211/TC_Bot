import 'dotenv/config'
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

// Load commands
client.commands = new Collection()
const commandFiles = readdirSync(join(__dirname, 'commands')).filter(f => f.endsWith('.js'))
for (const file of commandFiles) {
  const cmd = await import(pathToFileURL(join(__dirname, 'commands', file)).href)
  if (cmd.default?.data) client.commands.set(cmd.default.data.name, cmd.default)
}

// Load events
const eventFiles = readdirSync(join(__dirname, 'events')).filter(f => f.endsWith('.js'))
for (const file of eventFiles) {
  const event = await import(pathToFileURL(join(__dirname, 'events', file)).href)
  const ev = event.default
  if (!ev?.name) continue
  if (ev.once) {
    client.once(ev.name, (...args) => ev.execute(...args, client))
  } else {
    client.on(ev.name, (...args) => ev.execute(...args, client))
  }
}

client.login(process.env.BOT_TOKEN)
