$("document").ready(()=>{
    $('.rooms').on('click','li', (e)=>{
        let room_name = $(e.target).attr('room_name')
        let password = prompt('Room Password', 'Enter Password')
        $.post('/rooms/check',
            {room_name: room_name, room_password: password},
            (data)=>{
            console.log(data)
                if (data.status == 'success'){
                    window.location.href = '/rooms/' + room_name
                }else{
                    alert("Wrong Password")
                }
        })

    })
})