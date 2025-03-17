import os
from datetime import timedelta

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///belay.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS Configuration
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_EXPOSE_HEADERS = ["csrf_access_token"]
    
    # JWT Configuration
    SECRET_KEY = "notsosecret4"
    JWT_SECRET_KEY = "maybemoresecret5"
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_CSRF_CHECK_FORM = True
    
    # Bcrypt
    BCRYPT_LOG_ROUNDS = 12

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    JWT_COOKIE_SECURE = True