from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import database, Message, Reaction, User
from sqlalchemy.orm import joinedload

messages_bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@messages_bp.route('/<int:channel_id>', methods=['GET'])
@jwt_required()
def get_messages(channel_id):
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    messages = Message.query.filter_by(channel_id=channel_id, parent_message_id=None)\
        .add_columns(Message.reply_count) \
        .order_by(Message.created_at.desc())\
        .paginate(page=page, per_page=per_page)
    
    response = []
    for msg, reply_count in messages.items:
        formatted = format_message(msg)
        formatted['reply_count'] = reply_count
        response.append(formatted)
    
    return {
        'messages': response,
        'total_pages': messages.pages,
        'current_page': page}

@messages_bp.route('/<int:channel_id>', methods=['POST'])
@jwt_required()
def create_message(channel_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('content'):
        return {"msg": "Message content required"}, 400
    
    try:
        message = Message(
            content=data['content'],
            channel_id=channel_id,
            user_id=current_user_id,
            parent_message_id=data.get('parent_message_id')
        )
        
        database.session.add(message)
        database.session.commit()
        
        return format_message(message), 201
    
    except Exception as e:
        database.session.rollback()
        return {"msg": "Message creation failed", "error": str(e)}, 500

@messages_bp.route('/<int:message_id>/reactions', methods=['POST'])
@jwt_required()
def add_reaction(message_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('emoji'):
        return {"msg": "Emoji required"}, 400
    
    message = Message.query.get_or_404(message_id)

    reaction = Reaction.query.filter_by(
        message_id=message_id,
        user_id=current_user_id
    ).first()
    
    try:
        if reaction:
            reaction.emoji = data['emoji']
        else:
            reaction = Reaction(
                emoji=data['emoji'],
                message_id=message_id,
                user_id=current_user_id
            )
            database.session.add(reaction)
        
        database.session.commit()
        return format_reaction(reaction), 201
    
    except Exception as e:
        database.session.rollback()
        return {"msg": "Reaction failed", "error": str(e)}, 500
    
@messages_bp.route('/<int:message_id>/reactions', methods=['GET'])
@jwt_required()
def get_reactions(message_id):
    reactions = Reaction.query.filter_by(message_id=message_id).join(User).all()
    return jsonify({"reactions": [format_reaction(reaction) for reaction in reactions]}), 200

@messages_bp.route('/<int:message_id>/thread', methods=['GET'])
@jwt_required()
def get_thread(message_id):
    try:
        # Use outerjoin for replies and handle null cases
        parent_message = database.session.query(Message).options(
            joinedload(Message.replies).joinedload(Message.author)
        ).outerjoin(
            Message.replies
        ).filter(
            Message.id == message_id
        ).first()

        if not parent_message:
            return jsonify({"msg": "Message not found"}), 404

        replies = parent_message.replies if parent_message.replies else []

        return jsonify({
            'parentMessage': format_message(parent_message),
            'replies': [format_message(reply) for reply in replies]
        }), 200

    except Exception as e:
        print(f"Thread error: {str(e)}")
        return jsonify({"msg": "Failed to fetch thread", "error": str(e)}), 500

@messages_bp.route('/<int:message_id>/replies', methods=['POST'])
@jwt_required()
def create_reply(message_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('content'):
        return jsonify({"msg": "Message content required"}), 400
    
    try:
        parent_message = Message.query.get_or_404(message_id)
        
        reply = Message(
            content=data['content'],
            channel_id=parent_message.channel_id,
            user_id=current_user_id,
            parent_message_id=message_id
        )
        
        database.session.add(reply)
        database.session.commit()
        
        return jsonify(format_message(reply)), 201
        
    except Exception as e:
        database.session.rollback()
        return jsonify({"msg": "Reply creation failed", "error": str(e)}), 500

def format_message(message):
    return {
        'id': message.id,
        'content': message.content,
        'author': message.author.username,
        'channel_id': message.channel_id,
        'parent_id': message.parent_message_id,
        'created_at': message.created_at.isoformat(),
        'replies': [format_message(r) for r in message.replies],
        'reactions': [format_reaction(r) for r in message.reactions],
        'reply_count': getattr(message, 'reply_count', 0)
    }

def format_reaction(reaction):
    return {
        'id': reaction.id,
        'emoji': reaction.emoji,
        "user_id": reaction.user_id,
        "username": reaction.user.username,
        'created_at': reaction.created_at.isoformat()
    }