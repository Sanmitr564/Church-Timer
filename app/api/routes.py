from flask import request, Blueprint, current_app
import csv

from .exceptions import *

api_bp = Blueprint("api", __name__)

def propresenterUrl():
    return f"http://localhost:{current_app.extensions["propresenter_port"]}/"

@api_bp.put('/timers/start')
def login_post():
    data = request.get_json()
    section = data.get("section")
    person = data.get("person")
    minutes = data.get("minutes")
    seconds = data.get("seconds")

    minutes_int = None
    seconds_int = None
    try:
        minutes_int = int(minutes)
        seconds_int = int(seconds)
    except ValueError:
        raise InvalidTimerSet("Minutes and seconds must be integers")

    current_app.extensions["propresenterApi"].set_and_start_timer(minutes_int, seconds_int)
    current_app.extensions["timekeeper"].start(section, person, minutes_int * 60 + seconds_int)

    return "success"

@api_bp.put('/timers/stop')
def handleTimerStop():
    current_app.extensions["propresenterApi"].stop_timer()
    data = current_app.extensions["timekeeper"].stop()
    if data is None:
        return "success"
    write_results(data)
    return "success"

def write_results(data):
    with open("timekeeping.csv", "a") as file:
        writer = csv.writer(file)
        writer.writerow(data)

#DONE
@api_bp.get("/timers")
def getTimers():
    return current_app.extensions["propresenterApi"].get_timers()

#DONE
@api_bp.put("/timers/select/<uuid:timer_id>")
def selectTimer(timer_id):
    current_app.extensions["propresenterApi"].timer = str(timer_id)
    return "success"

#DONE
@api_bp.get("/port/get")
def getPort():
    return str(current_app.extensions["propresenterApi"].port)

#DONE
@api_bp.put("/port/set/<int:port>")
def setPort(port):
    current_app.extensions["propresenterApi"].port = port
    return "success"
