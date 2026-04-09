import User from "./models/user.model.js"
import ChatMessage from "./models/chat.model.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(socket.id)
    socket.on('identity', async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          socketId: socket.id, isOnline: true
        }, { new: true })
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('chatMessage', async (message) => {
      try {
        const savedMessage = await ChatMessage.create({
          senderId: message.senderId || null,
          senderName: message.name || 'Guest',
          senderRole: message.sender || 'guest',
          text: message.text || '',
          image: message.image || null,
          target: message.target || 'all',
          recipientId: message.recipientId || null,
          recipientName: message.recipientName || null,
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
        })

        const broadcastPayload = {
          id: savedMessage._id.toString(),
          senderId: savedMessage.senderId?.toString() || null,
          sender: savedMessage.senderRole,
          name: savedMessage.senderName,
          text: savedMessage.text,
          image: savedMessage.image,
          target: savedMessage.target,
          recipientId: savedMessage.recipientId?.toString() || null,
          recipientName: savedMessage.recipientName || null,
          timestamp: savedMessage.timestamp
        }

        const target = savedMessage.target
        if (savedMessage.recipientId) {
          const recipient = await User.findById(savedMessage.recipientId)
          if (recipient?.socketId) {
            io.to(recipient.socketId).emit('chatBroadcast', broadcastPayload)
          }
          return
        }

        if (target === 'all') {
          socket.broadcast.emit('chatBroadcast', broadcastPayload)
          return
        }

        if (['owner', 'deliveryBoy', 'user'].includes(target)) {
          const recipients = await User.find({ role: target, socketId: { $ne: null } })
          if (recipients.length === 0) {
            socket.broadcast.emit('chatBroadcast', broadcastPayload)
            return
          }
          recipients.forEach((recipient) => {
            if (recipient.socketId) {
              io.to(recipient.socketId).emit('chatBroadcast', broadcastPayload)
            }
          })
          return
        }

        socket.broadcast.emit('chatBroadcast', broadcastPayload)
      } catch (error) {
        console.log('chatMessage broadcast error', error)
      }
    })

    socket.on('userQuery', async ({ userId, userName, query, response }) => {
      try {
        const owners = await User.find({ role: 'owner', socketId: { $ne: null } })
        owners.forEach((owner) => {
          if (owner.socketId) {
            io.to(owner.socketId).emit('newUserQuery', {
              userId,
              userName,
              query,
              response
            })
          }
        })
      } catch (error) {
        console.log('userQuery event error', error)
      }
    })

    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          io.emit('updateDeliveryLocation',{
            deliveryBoyId:userId,
            latitude,
            longitude
          })
        }


      } catch (error) {
          console.log('updateDeliveryLocation error')
      }
    })




    socket.on('disconnect', async () => {
      try {

        await User.findOneAndUpdate({ socketId: socket.id }, {
          socketId: null,
          isOnline: false
        })
      } catch (error) {
        console.log(error)
      }

    })
  })
}