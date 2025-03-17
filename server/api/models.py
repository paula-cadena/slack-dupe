from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, UTC
from flask_bcrypt import Bcrypt
from sqlalchemy import select, func
from sqlalchemy.ext.hybrid import hybrid_property

database = SQLAlchemy()
bcrypt = Bcrypt()

class User(database.Model):
    __tablename__ = 'users'
    id = database.Column(database.Integer, primary_key=True)
    username = database.Column(database.String(80), unique=True, nullable=False)
    password_hash = database.Column(database.String(120), nullable=False)
    created_at = database.Column(database.DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    messages = database.relationship('Message', backref='author', lazy=True)
    reactions = database.relationship('Reaction', backref='user', lazy=True)
    channels = database.relationship('UserChannel', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Channel(database.Model):
    __tablename__ = 'channels'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String(80), unique=True, nullable=False)
    created_at = database.Column(database.DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    messages = database.relationship('Message', backref='channel', lazy=True)
    users = database.relationship('UserChannel', backref='channel', lazy=True)

class Message(database.Model):
    __tablename__ = 'messages'
    id = database.Column(database.Integer, primary_key=True)
    content = database.Column(database.Text, nullable=False)
    channel_id = database.Column(database.Integer, database.ForeignKey('channels.id'), nullable=False)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), nullable=False)
    parent_message_id = database.Column(database.Integer, database.ForeignKey('messages.id'))
    created_at = database.Column(database.DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    replies = database.relationship(
        'Message',
        backref=database.backref('parent', remote_side=[id]),
        lazy='dynamic',
        collection_class=list
    )

    reactions = database.relationship('Reaction', backref='message', lazy=True)

    @hybrid_property
    def reply_count(self):
        return self.replies.count()

    @reply_count.expression
    def reply_count(cls):
        return select(
            func.count(Message.id)
        ).where(
            Message.parent_message_id == cls.id
        ).label('reply_count')

class Reaction(database.Model):
    __tablename__ = 'reactions'
    id = database.Column(database.Integer, primary_key=True)
    emoji = database.Column(database.String(10), nullable=False)
    message_id = database.Column(database.Integer, database.ForeignKey('messages.id'), nullable=False)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), nullable=False)
    created_at = database.Column(database.DateTime, default=lambda: datetime.now(UTC))

class UserChannel(database.Model):
    __tablename__ = 'user_channels'
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), primary_key=True)
    channel_id = database.Column(database.Integer, database.ForeignKey('channels.id'), primary_key=True)
    last_read_message_id = database.Column(database.Integer)