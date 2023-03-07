from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, emit
import json
import traceback

app = Flask(__name__)
app.config["DEBUG"] = True
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app)

@app.route('/')
def index():
    if "username" in session:
        return redirect(url_for('chat'))
    return render_template('index.html')


if __name__ == '__main__':
    socketio.run(app)