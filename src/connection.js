const { constants } = require('buffer')
const mongoConnection = require('./config/mongoConnection')

module.exports = HandleConnection = async () => {
  const db = require('./config/mongoConnection')(mongoConnection)
  const Client = require('./schemas/newClient')
  const { authInfo } = require('./authInfo')
  const WhatsAppWeb = require('@adiwajshing/baileys')
  const { WAConnection, MessageType, Presence, MessageOptions, Mimetype, WALocationMessage, WA_MESSAGE_STUB_TYPES, ReconnectMode, ProxyAgent, waChatKey } = WhatsAppWeb
  const conn = new WAConnection()
  const fs = require('fs')

  conn.autoReconnect = ReconnectMode.onConnectionLost
  conn.connectOptions.maxRetries = 10
  conn.charOrderingKey = waChatKey(true)
  conn.on('chats-received', ({ hasNewChats }) => {
    console.log(`you have ${conn.chats.length} chats, new chats available: ${hasNewChats}`)
  })
  conn.on('contacts-received', () => {
    console.log(`you have ${Object.keys(conn.contacts).length} contacts`)
  })
  conn.on('initial-data-received', () => {
    console.log('received all initial messages')
  })

  //fs.existsSync('./auth_info.json') &&

  await conn.loadAuthInfo(authInfo)
  await conn.connect()
  //const authInfo = conn.base64EncodedAuthInfo() // get all the auth info we need to restore this session
  //fs.writeFileSync('./auth_info.json', JSON.stringify(authInfo, null, '\t')) // save this info to a file

  conn.on('message-new', async m => {
    if (m.key.fromMe) {
      return false
    }

    const sender = m.key.remoteJid.split('@')[0]
    console.log(sender)

    const findClient = await Client.findOne({ number: sender })
    if (!findClient) {
      await Client.create({
        number: sender,
      })
    }

    const messageContent = m.message
    if (!messageContent) return
    const messageType = Object.keys(messageContent)[0]

    try {
      await conn.chatRead(m.key.remoteJid)
      await conn.updatePresence(m.key.remoteJid, Presence.updatePresence)
      if (messageType !== MessageType.text) return conn.sendMessage(m.key.remoteJid, 'Desculpe, nao entendi.', MessageType.text)
    } catch (err) {
      if (err) throw err
    }
  })
}
