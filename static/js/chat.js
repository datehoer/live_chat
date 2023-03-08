let room = '{{ room }}'
    let username = '{{ username }}'
    let inp = document.querySelector('#send-msg-inp')
    let sendMsgBtn = document.querySelector('#send-msg-btn')
    let messageBox = document.querySelector('#message-box')
    let leaveroom = document.querySelector('#leaveroom')
    let socket = io();
    // 连接
    socket.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // 加入房间
    socket.emit('join', {
        username: username,
        room: room
    })
    // 退出房间
    leaveroom.onclick = function () {
        socket.emit('leave', {
            username: username,
            room: room
        })
    }
    // 发送消息
    sendMsgBtn.onclick = function () {
        let inp = document.querySelector('#send-msg-inp')
        let msg = inp.value
        let user = document.querySelector('#username').innerHTML
        inp.value = ''
        if (msg) {
            socket.emit('send msg', {
                user: user,
                message: msg,
            })
            messageBox.scrollTop = messageBox.scrollHeight
        } else {
            alert('消息不能为空')
        }
    }
    // 回车发送消息
    inp.addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            sendMsgBtn.click();
        }
    });
    // 连接的信息
    socket.on('connect info', function (data) {
        console.log(data)
        let connectInfo = document.createElement('div')
        connectInfo.className = 'row'
        let msg = `
              <div class="col s4 offset-s4">
                <div class="connect-info grey lighten-4 center" >
                  <span class="black-text">${data}
                  </span>
                </div>
              </div>`
        connectInfo.innerHTML = msg
        messageBox.appendChild(connectInfo)
    })
    // 接受消息
    socket.on('send msg', function (data) {
        console.log(data)
        console.log(socket.id)
        let msg = null
        let msgbox = document.createElement('div')
        msgbox.className = 'row'
        if (data.user === document.querySelector('#username').innerHTML) {
            msg = `
              <div class="col right">
                <div class="tag teal z-depth-3" >
                  <span class="white-text">${data.message}
                  </span>
                </div>
              </div>`
        } else {
            msg = `
              <div class="col">
                <div class="tag z-depth-3">
                  <span class="teal-text"><b>${data.user}</b>:  ${data.message}
                  </span>
                </div>
              </div>`
        }
        msgbox.innerHTML = msg
        messageBox.appendChild(msgbox)
        messageBox.scrollTop = messageBox.scrollHeight
    })