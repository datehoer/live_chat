$('document').ready(() => {
    /* connect to socket */
    console.log('ok')
    let socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

    socket.on('connect', () => {
        $("#send").click(() => {
            const msg = $('#chatInput').val();
            const post_time = new Date();
            console.log(msg);
            socket.emit('send msg', {'user': encodeURI(act_user), 'time': post_time,
                'msg': encodeURI(msg), 'room': encodeURI(act_room)});
        });
    });

    socket.on('emit msg', data => {
        console.log('emit msg: ' + JSON.stringify(data));
        if (act_room == data.room){
            const posttime = new Date(data.time);
            const chatTable = $('#chat-table');
            const chatLi = `
                        <li class="list-group-item" data-publish-time="${posttime}">
                            <span class="user-name">${decodeURI(data.user)}</span>
                            <span>:</span>
                            <span class="user-msg"><strong>decodeURI(data.msg)</strong></span>
                        </li>`
            // const content = template(
            //     {'post_id': data.id, 'post_user': decodeURI(data.user),
            //      'post_time': format_date(posttime),
            //      'post_msg': decodeURI(data.msg),
            //      'same_user': decodeURI(data.user)==act_user});
            // document.querySelector("#msgTbl").innerHTML += content;
            // document.querySelector("#msg").value = '';
            /* scroll to the page bottom */
            // window.scrollTo(0, document.body.scrollHeight);
            chatTable.append(chatLi);
        }
    })
})