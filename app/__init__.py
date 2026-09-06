from flask import Flask
from .api import initApp as initApi
from .api.propresenterApi import PropresenterApi
from .api.timekeeper import Timekeeper
from .main import initApp as initMain

def createApp():
    app = Flask(__name__)
    app.extensions["propresenterApi"] = PropresenterApi() #TODO: get previous values
    app.extensions["timekeeper"] = Timekeeper()
    initApi(app)
    initMain(app)
    return app
