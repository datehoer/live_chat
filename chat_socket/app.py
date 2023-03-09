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
channels = dict()


@app.route("/")
def index():
    # 根目录判断是否登录
    if session.get("act_user") is None:
        return redirect(url_for("login"))
    else:
        return get_channels()


@app.route("/channels", methods=['GET'])
def get_channels():
    # 获取频道列表
    app.logger.info(str(channels))
    last_visit = users.get(session.get("act_user"))
    # 如果上次访问的频道已经不存在了，那么就不显示上次访问的频道
    if last_visit not in channels.keys():
        last_visit = None
    return render_template(
        "channels.html",
        act_user=session.get("act_user"),
        channels=[{'name': k, 'created': channels[k]['created']} for k in channels],
        last_visit=last_visit
    )


@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == "GET":
        return get_channels()
    elif request.method == "POST":
        username = request.form.get("displayName")
        if username not in users.keys():
            flash("New username {} created.".format(username), "success")
            users[username] = None
        session['act_user'] = username
        return redirect(url_for("get_channels"))


@app.route("/logout")
def logout():
    session.pop('act_user', None)
    flash("You have logged out.")
    return redirect(url_for("index"))


@app.route("/channels", methods=['POST'])
def set_channels():
    new_channel = request.form.get("new_channel").strip()
    if new_channel != "":
        if new_channel in channels.keys():
            flash("Channel {} already exists.".format(new_channel), "warning")
        else:
            flash("The new channel {} has been created.".format(new_channel), 'success')
            channels[new_channel] = {"created": datetime.datetime.now(), "max_id": 0, "chats": {}}
    else:
        flash("Channel name cannot be empty.", 'warning')
    return redirect(url_for("get_channels"))


@app.route("/channel/<channel>", methods=['GET'])
def get_channel(channel):
    if session.get('act_user') is None:
        flash("You are not logged in.", 'danger')
        return redirect(url_for("index"))
    users[session.get('act_user')] = channel
    return render_template(
        "channel.html",
        act_user=session.get("act_user"),
        channel=channel,
        chats=channels[channel]['chats']
    )


@socketio.on("send msg")
def emit_msg(data):
    # if msg is blank, do not emit
    if data['msg'] != '':
        channel = urllib.parse.unquote(data['channel'])
        chats = channels[channel]['chats']
        id = channels[channel]['max_id']
        chats[str(id)] = {'user': data['user'], 'time': data['time'], 'msg': data['msg']}
        channels[channel]['max_id'] += 1
        if len(chats) > 100:
            chats = chats[(len(chats)-100):]
        channels[channel]['chats'] = chats

        emit('emit msg',
             {'id': id, 'user': data['user'], 'time': data['time'],
              'msg': data['msg'], 'channel': channel}, broadcast=True)

@socketio.on("del msg")
def del_msg(data):
    channel = urllib.parse.unquote(data['channel'])
    chats = channels[channel]['chats']
    app.logger.info(str(chats) + "\nDel: " + str(data))
    channels[channel]['chats'].pop(data['id'])


if __name__ == '__main__':
    app.debug = False
    # handler = logging.FileHandler("flask.log", encoding="UTF-8")
    # handler.setLevel(logging.DEBUG)
    # logging_format = logging.Formatter('%(asctime)s - %(levelname)s - %(filename)s - %(funcName)s - %(lineno)s - %(message)s')
    # handler.setFormatter(logging_format)
    # app.logger.addHandler(handler)
    socketio.run(app, host='0.0.0.0', port=5000)