from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register blueprint
    from routes.upload import upload_bp
    from routes.generate import bp as generate_bp

    app.register_blueprint(upload_bp)
    app.register_blueprint(generate_bp)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
