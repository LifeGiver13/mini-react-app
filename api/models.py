from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class Users(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email_address = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')
    profile_photo = db.Column(db.String(120), default='default.png')
    user_bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Password property and setter to hash password automatically
    @property
    def password(self):
        raise AttributeError('Password is not readable.')

    @password.setter
    def password(self, password_plaintext):
        self.password_hash = generate_password_hash(password_plaintext)

    def check_password(self, password_plaintext):
        return check_password_hash(self.password_hash, password_plaintext)

    def __repr__(self):
        return f"<User {self.username}>"
