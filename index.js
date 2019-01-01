const logger = require('tracer').console()

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', (req, res) => {
  // res.send('<h1> Hello world </ h1>')
  res.sendFile(`${__dirname}/template/index.html`)
})

const users = []
const nameMap = {}

io.on('connection', socket => { // 每一个新链接建立都会触发该事件
  logger.info('a user connected')
  users.push(socket.id)
  socket.on('disconnect', () => { // 每个socket也能触发disconnect事件
    if (users.includes(socket.id)) {
      users.splice(users.indexOf(socket.id), 1)
      if (nameMap[socket.id]) io.emit('quit', {newUserId: nameMap[socket.id], users})
    logger.info('user disconnect')
    }
  })
  socket.on('editName', name => {
    nameMap[socket.id] = name
    socket.broadcast.emit('join', {newUserId: nameMap[socket.id], users}) // 广播，发送除自己的其他人
  })
  socket.on('chatMessage', msg => {
    logger.info('message: ' + msg)
    const data = {name: nameMap[socket.id], msg}
    if (data.newUserId === 'root') data.nameMap = nameMap
    io.emit('chatMessage', data)
  })
})

http.listen(3000, () => {
  logger.info('listening on *:3000')
})



