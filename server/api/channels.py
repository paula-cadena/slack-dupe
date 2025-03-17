from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import database, Channel, UserChannel, Message, User

channels_bp = Blueprint('channels', __name__, url_prefix='/api/channels')

@channels_bp.route('', methods=['GET'])
@jwt_required()
def get_channels():
    current_user_id = get_jwt_identity()
    
    channels = Channel.query.all()
    response = []
    
    for channel in channels:
        unread_count = database.session.query(Message.id).filter(
            Message.channel_id == channel.id,
            Message.id > UserChannel.last_read_message_id,
            UserChannel.user_id == current_user_id,
            UserChannel.channel_id == channel.id
        ).count()
        
        response.append({
            'id': channel.id,
            'name': channel.name,
            'unread': unread_count,
            'created_at': channel.created_at.isoformat()
        })
    
    return response

@channels_bp.route('', methods=['POST'])
@jwt_required()
def create_channel():
    data = request.get_json()
    
    if not data.get('name'):
        return {"msg": "Channel name required"}, 400
    
    existing = Channel.query.filter_by(name=data['name']).first()
    if existing:
        return {"msg": "Channel name already exists"}, 409
    
    try:
        channel = Channel(name=data['name'])
        database.session.add(channel)
        database.session.commit()

        users = User.query.all()
        for user in users:
            database.session.add(UserChannel(user_id=user.id, channel_id=channel.id, last_read_message_id=0))
            database.session.commit()

        return {
            'id': channel.id,
            'name': channel.name
        }, 201
        
    except Exception as e:
        database.session.rollback()
        return {"msg": "Channel creation failed", "error": str(e)}, 500

@channels_bp.route('/<int:channel_id>', methods=['GET'])
@jwt_required()
def get_channel(channel_id):
    current_user_id = get_jwt_identity()

    channel = Channel.query.get_or_404(channel_id)

    last_message = Message.query.filter_by(channel_id=channel_id)\
        .order_by(Message.id.desc()).first()

    if last_message:
        user_channel = UserChannel.query.filter_by(
            user_id=current_user_id,
            channel_id=channel_id
        ).first()
        
        user_channel.last_read_message_id = last_message.id
        database.session.commit()

    return {
        'id': channel.id,
        'name': channel.name,
        'created_at': channel.created_at.isoformat()
    }
