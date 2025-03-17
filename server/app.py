from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.models import database, bcrypt
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    database.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    CORS(app,
        supports_credentials=True,
        resources={r"/api/*": {"origins": "http://localhost:3000"}},
        expose_headers=["Content-Type", "Authorization", "X-CSRF-TOKEN"],
        allow_headers=["Content-Type", "Authorization", "X-CSRF-TOKEN"],
        methods=["GET", "POST", "PUT", "DELETE"]
    )

    # Register blueprints
    from api.auth import auth_bp
    from api.channels import channels_bp
    from api.messages import messages_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(channels_bp)
    app.register_blueprint(messages_bp)

    # Create tables
    with app.app_context():
        database.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)