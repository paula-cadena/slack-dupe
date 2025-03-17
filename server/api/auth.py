from flask import Blueprint, jsonify, request, make_response, redirect, url_for
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from .models import database, User, bcrypt, Channel, UserChannel
from datetime import datetime, timedelta
from flask_cors import cross_origin

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return {"msg": "Missing username or password"}, 400
    
    if User.query.filter_by(username=data['username']).first():
        return {"msg": "Username already exists"}, 409
    
    try:
        user = User(username=data['username'])
        user.set_password(data['password'])
        database.session.add(user)
        database.session.commit()
        
        # Create access token with fresh status
        access_token = create_access_token(
            identity=str(user.id),
            fresh=timedelta(minutes=15),
            expires_delta=timedelta(hours=1)
        )
        
        response = make_response(jsonify({
            "msg": "Signup successful",
            "user": {"id": str(user.id), "username": user.username},
            "access_token": access_token
        }))

        channels = Channel.query.all()
        for channel in channels:
            database.session.add(UserChannel(user_id=user.id, channel_id=channel.id, last_read_message_id=0))
            database.session.commit()
        
        return response, 201

    except Exception as e:
        database.session.rollback()
        return {"msg": "Registration failed", "error": str(e)}, 500

@auth_bp.route('/login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if not user or not user.check_password(data.get('password')):
        return {"msg": "Invalid credentials"}, 401
    
    # Create fresh token for login
    access_token = create_access_token(
        identity=str(user.id),
        fresh=True,
        expires_delta=timedelta(hours=1)
    )
    
    response = make_response(jsonify({
        "msg": "Login successful",
        "user": {"id": user.id, "username": user.username},
        "access_token": access_token
    }))
    
    return response

@auth_bp.route('/logout', methods=['POST'])
@cross_origin()
def logout():
    response = make_response(jsonify({"msg": "Logout successful"}))
    response.headers.pop('Authorization', None)
    return redirect(url_for('auth.login'))

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return {"msg": "User not found"}, 404

    if not data.get('currentPassword'):
        return {"msg": "Current password is required"}, 400

    if not user.check_password(data['currentPassword']):
        return {"msg": "Invalid current password"}, 401

    updates = {}

    new_username = data.get('newUsername')
    if new_username and new_username != user.username:
        if User.query.filter_by(username=new_username).first():
            return {"msg": "Username already taken"}, 409
        updates['username'] = new_username

    if data.get('newPassword'):
        if len(data['newPassword']) < 6:
            return {"msg": "Password must be at least 6 characters"}, 400
        updates['password'] = data['newPassword']

    if not updates:
        return {"msg": "No changes provided"}, 400

    try:
        if 'username' in updates:
            user.username = updates['username']
        if 'password' in updates:
            user.set_password(updates['password'])
        
        database.session.commit()
        return {"msg": "Profile updated successfully"}, 200
        
    except Exception as e:
        database.session.rollback()
        return {"msg": "Update failed", "error": str(e)}, 500

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(
        logged_in_as=user.username,
        user_id=user.id,
        session_expires=datetime.utcnow() + timedelta(hours=1)
    ), 200