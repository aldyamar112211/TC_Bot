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

// Auto-deploy slash commands ke Discord pas bot nyala.
// Default nyala; matiin dengan set AUTO_DEPLOY_COMMANDS=false di env.
if (process.env.AUTO_DEPLOY_COMMANDS !== 'false') {
  try {
    const body = [...client.commands.values()].map(c => c.data.toJSON())
    const rest = new REST().setToken(process.env.BOT_TOKEN)
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body },
    )
    console.log(`Auto-deployed ${body.length} slash command(s).`)
  } catch (err) {
    console.error('Gagal auto-deploy commands:', err.message)
  }
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

client.on('error', (err) => {
  console.error('[client error]', err)
})

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err)
})

client.login(process.env.BOT_TOKEN)
