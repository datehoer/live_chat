from flask import Flask, flash, render_template, redirect, session, request, url_for, jsonify
from flask_socketio import SocketIO, emit
import logging
import urllib.parse
import datetime

app = Flask(__name__, static_folder="static")
app.config["SECRET_KEY"] = "secret"
app.config['SESSION_TYPE'] = 'filesystem'
socketio = SocketIO(app)
users = dict()
rooms = dict()


@app.route("/")
def index():
    return render_template("login.html")


@app.route("/rooms", methods=['GET'])
def get_rooms():
    return render_template(
        "rooms.html",
        rooms=rooms
    )


@app.route("/add_room", methods=['GET', 'POST'])
def add_room():
    if request.method == "POST":
        room_name = request.form.get("room_name")
        rooms[room_name] = {
            "created": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "max_id": 0,
            "chats": {}
        }
        return redirect(url_for("get_rooms"))


@app.route("/rooms/<room_name>", methods=['GET'])
def get_room(room_name):
    if 'chats' not in rooms[room_name]:
        rooms[room_name]['chats'] = []
    user = session.get("act_user")
    return render_template(
        "room.html",
        room_name=room_name,
        act_user=user,
        chats=rooms[room_name]['chats']
    )


@socketio.on("send msg")
def send_msg(data):
    msg = data["msg"]
    if msg == "":
        return
    room = data["room"]
    emit("emit msg", {
        'id': id,
        'user': data['user'],
        'time': data['time'],
        'msg': data['msg'],
        'room': room}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)