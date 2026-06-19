import 'dotenv/config'
import { REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const commands = []
const commandFiles = readdirSync(join(__dirname, 'commands')).filter(f => f.endsWith('.js'))
for (const file of commandFiles) {
  const cmd = await import(pathToFileURL(join(__dirname, 'commands', file)).href)
  if (cmd.default?.data) commands.push(cmd.default.data.toJSON())
}

const rest = new REST().setToken(process.env.BOT_TOKEN)

console.log(`Deploying ${commands.length} slash command(s)...`)

await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commands },
)

console.log('Slash commands deployed!')
