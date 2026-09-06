from .routes import main_bp

def initApp(app):
    app.register_blueprint(main_bp)