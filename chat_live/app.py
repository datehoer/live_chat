from flask import Flask, flash, render_template, redirect, session, request, url_for, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import logging
import urllib.parse
import datetime
import json
from uuid import uuid4

app = Flask(__name__, static_folder="static")
app.config["SECRET_KEY"] = "secret"
app.config['SESSION_TYPE'] = 'filesystem'
socketio = SocketIO(app)
users = dict()
rooms = dict()


@app.route("/")
def index():
    if 'act_user' in session:
        return redirect(url_for("get_rooms"))
    return render_template("login.html")


@app.route("/login", methods=['POST'])
def login():
    if request.method == "POST":
        user = request.form.get("userName")
        if user == "":
            return redirect(url_for("index"))
        if user not in users.keys():
            users[user] = None
        session['act_user'] = user
        return redirect(url_for("get_rooms"))


@app.route("/rooms", methods=['GET'])
def get_rooms():
    if 'act_user' in session:
        user = session.get("act_user")
        if user is None:
            return redirect(url_for("index"))
        return render_template(
            "rooms.html",
            rooms=rooms,
            act_user=user
        )
    else:
        return redirect(url_for("index"))


@app.route("/add_room", methods=['GET', 'POST'])
def add_room():
    if request.method == "POST":
        room_name = request.form.get("room_name")
        room_password = request.form.get("room_password")
        room_tips = request.form.get("room_tips")
        rooms[room_name] = {
            "created": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "max_id": 0,
            "chats": [],
            "password": room_password,
            "tips": room_tips
        }
        return redirect(url_for("get_rooms"))


@app.route('/logout')
def logout():
    if "act_user" in session:
        session.clear()
    return redirect(url_for('index'))


@app.route("/rooms/<room_name>", methods=['GET'])
def get_room(room_name):
    if 'act_user' not in session:
        return redirect(url_for("index"))
    if room_name in rooms.keys():
        if 'chats' not in rooms[room_name]:
            rooms[room_name]['chats'] = []
        user = session.get("act_user")
        return render_template(
            "room.html",
            room_name=room_name,
            act_user=user,
            chats=rooms[room_name]['chats']
        )
    else:
        return redirect(url_for("get_rooms"))


@app.route("/rooms/check", methods=['POST'])
def check_room():
    if request.method == "POST":
        room_name = request.form.get("room_name")
        room_password = request.form.get("room_password")
        if room_name in rooms.keys():
            if rooms[room_name]['password'] == room_password:
                return jsonify({'status': 'success'})
            else:
                return jsonify({'status': 'error'})
        else:
            return jsonify({'status': 'error'})


@socketio.on("send msg")
def send_msg(data):
    msg = data["msg"]
    if msg == "":
        return
    room = data["room"]
    msg_id = rooms[room]['max_id'] = rooms[room]['max_id']+1
    rooms[room]['chats'].append({
        'id': msg_id,
        'user': data['user'],
        'time': data['time'],
        'msg': data['msg']
    })
    emit("emit msg", {
        'id': msg_id,
        'user': data['user'],
        'time': data['time'],
        'msg': data['msg'],
        'room': room}, broadcast=True)


@socketio.on('join')
def on_join(data):
    username = data.get('user')
    room = data.get('room')
    try:
        users[room].append(username)
    except Exception as e:
        users[room] = []
        users[room].append(username)

    join_room(room)
    emit('connect info', {'user': username, 'room': room, 'msg': "加入房间", "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")})


@socketio.on('leave')
def on_leave(data):
    username = data.get('user')
    room = data.get('room')
    users[room].remove(username)
    leave_room(room)
    socketio.emit('connect info', username + '离开房间', to=room)


if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)