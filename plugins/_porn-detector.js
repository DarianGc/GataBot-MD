import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import fetch from 'node-fetch'
let { downloadContentFromMessage } = (await import(global.baileys))
import path from 'path'  

let handler = m => m
handler.before = async function (m, { conn, __dirname }) {
let media, link, buffer
try{
let q = m
let mime = (q.msg || q).mimetype || q.mediaType || ''
if (!(/sticker|image/.test(mime)) || m.mtype == 'viewOnceMessageV2') return

let isTele = /^image\/(png|jpe?g)$/.test(mime)
if (isTele) {
media = await q.download()
link = await uploadImage(media)
}

if (m.mtype == 'viewOnceMessageV2') {
let msg = m.message.viewOnceMessageV2.message
let type = Object.keys(msg)[0]
if (type == 'imageMessage') {
media = await downloadContentFromMessage(msg[type], 'image')
buffer = Buffer.from([])
for await (const chunk of media) {
buffer = Buffer.concat([buffer, chunk])
}
link = await uploadImage(buffer)
}}

if (m.mtype == 'stickerMessage') {
media = await q.download()
//buffer = Buffer.from(media)
//let out = await webp2png(buffer).catch(_ => null) || Buffer.alloc(0)
//link = await uploadImage(out)
const webpLocation = path.join(__dirname, '..', 'tmp', 'out.webp')
await fs.writeFileSync(webpLocation, media)
const bufferPNG = await webp2png(Buffer.from(webpLocation, 'base64'))//.catch(_ => null) || Buffer.alloc(0) //await webp2png(fs.readFileSync(webpLocation)).catch(_ => null) || Buffer.alloc(0)
link = await uploadImage(bufferPNG)
await fs.unlinkSync(webpLocation)
}

if (link) {
const response = await fetch(`https://api.alyachan.dev/api/porn-detector?image=${link}&apikey=GataDios`)
const result = await response.json()
await m.reply(link)
console.log(result.data.isPorn || 'null')
if (result.status && result.data && result.data.isPorn) {
await m.reply('La imagen contiene contenido para adultos.')

//let delet = m.key.participant
//let bang = m.key.id
//return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
}
}} catch (error) {
await m.reply(error.toString())
}
  
}		
export default handler
