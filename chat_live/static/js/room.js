$('document').ready(() => {
    /* connect to socket */
    console.log('ok')
    $('.chat-table').scrollTop($('.chat-table ul').height())
    let socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);
    socket.emit('join', {
        user: encodeURI(act_user),
        room: encodeURI(act_room)
    })
    socket.on('connect', () => {
        $("#send").click(() => {
            const msg = $('#chatInput').val();
            $('#chatInput').val('');
            const post_time = new Date();
            console.log(msg);
            socket.emit('send msg', {'user': encodeURI(act_user), 'time': post_time,
                'msg': encodeURI(msg), 'room': encodeURI(act_room)});
        });
        $("#chatInput").keypress((e) => {
            if(e.which == 13) {
                const msg = $('#chatInput').val();
                $('#chatInput').val('');
                const post_time = new Date();
                console.log(msg);
                socket.emit('send msg', {'user': encodeURI(act_user), 'time': post_time,
                    'msg': encodeURI(msg), 'room': encodeURI(act_room)});
                }
        });


    });

    socket.on('emit msg', data => {
        console.log('emit msg: ' + JSON.stringify(data), data.room, act_room);
        if (act_room == data.room){
            const chatTableUl = $('.chat-table ul');
            const chatTableLi = `
                        <li class="list-group-item" data-publish-time="${data.time}" title="${data.time}">
                            <span class="user-name">${decodeURI(data.user)}</span>
                            <span>:</span>
                            <span class="user-msg"><strong>${decodeURI(data.msg)}</strong></span>
                        </li>`
            chatTableUl.append(chatTableLi);
            const chatTable = $('.chat-table');
            chatTable.scrollTop(chatTableUl.height());
        }
    })
    socket.on('connect info', function (data) {
        const chatTableUl = $('.chat-table ul');
        const chatTableLi = `
                        <li class="list-group-item" data-publish-time="${data.time}" title="${data.time}">
                            <span class="user-name">${decodeURI(data.user)}</span>
                            <span>:</span>
                            <span class="user-msg"><strong>${decodeURI(data.msg)}</strong></span>
                        </li>`
            chatTableUl.append(chatTableLi);
            const chatTable = $('.chat-table');
            chatTable.scrollTop(chatTableUl.height());
    })
})