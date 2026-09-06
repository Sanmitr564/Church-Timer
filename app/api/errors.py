from flask import jsonify
from .exceptions import *

def register_error_handlers(bp):
    @bp.errorhandler(TimerNotFound)
    def handleTimerNotFound(error):
        return jsonify({
                "error": "timer_not_found",
                "message": str(error),
            }), 502

    @bp.errorhandler(PropresenterUnavailable)
    def handlePropresenterUnavailable(error):
        return jsonify({
            "error": "propresenter_unavailable",
            "message": str(error)
        }), 502

    @bp.errorhandler(PropresenterNotFound)
    def handlePropresenterNotFound(error):
        return jsonify({
            "error": "propresenter_not_found",
            "message": str(error)
        }), 502

    @bp.errorhandler(InvalidTimerSet)
    def handleInvalidTimerSet(error):
        return jsonify({
            "error": "invalid_timer_set",
            "message": str(error)
        }), 400