const socket = io()

const messageForm = document.querySelector('form')
const inputField = document.querySelector('input')
const messageFormButton = document.querySelector('button')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
// const sidebar = document.querySelector('#sidebar').innerHTML

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options

const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const autoScroll = () => {
  //new message element
  const newMessage = messages.lastElementChild

  //Height of the new message
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  const visibleHeight = messages.offsetHeight

  const containerHeight = messages.scrollHeight

  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
}

socket.on('message', (message) => {
  console.log(`new Message : ${message.username}`)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('connection', () => {
  console.log('admin')
})

socket.on('messageLocation', (location) => {
  console.log(location)

  const html = Mustache.render(locationTemplate, {
    username: location.username,
    url: location.text,
    createdAt: moment(location.createdAt).format('h:mm a'),
  })

  // messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  })
  document.querySelector('#sidebar').innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  messageFormButton.setAttribute('disabled', true)

  const message = e.target.elements.message
  socket.emit('sendMessage', message.value, (error) => {
    if (error) {
      alert('Profanity is not allowed')
      setTimeout(() => messageFormButton.removeAttribute('disabled'), 500)
      return console.log(error)
    }

    console.log('Message Delivered')

    setTimeout(() => messageFormButton.removeAttribute('disabled'), 500)
    inputField.value = ''
    inputField.focus()
  })
})

socket.on('message', (message) => {
  console.log(message)
})

locationButton.addEventListener('click', (e) => {
  locationButton.setAttribute('disabled', true)
  if (!navigator.geolocation) {
    return alert('GeoLocation is not supported by your browser')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { coords } = position
    console.log(position)

    socket.emit(
      'location',
      {
        longitude: coords.longitude,
        latitude: coords.latitude,
      },
      (error) => {
        locationButton.removeAttribute('disabled')
        if (error) {
          return console.log(error)
        }
        console.log('Location Shared')
      }
    )
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})

// socket.on('sharedLocation', (location) => {
//   console.log(`location:${location.latitude}, ${location.longitude}`)
// })

// socket.on("countUpdated", (count) => {
//   console.log("count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("clicked");
//   socket.emit("increment");
// });
