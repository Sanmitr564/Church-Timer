from .routes import api_bp
from .errors import register_error_handlers
def initApp(app):
    register_error_handlers(api_bp)
    app.register_blueprint(api_bp, url_prefix="/api")