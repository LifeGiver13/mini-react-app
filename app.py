from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import base64


app = Flask(__name__)
CORS(app, supports_credentials=True)

# Secret key for session
app.secret_key = os.environ.get("SECRET_KEY", "supersecret")

# Database (adjust your DB URI if using PythonAnywhere MySQL)
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://LifeGiver13:watcher13@LifeGiver13.mysql.pythonanywhere-services.com/LifeGiver13$scroll_saga"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# ------------------ Models ------------------


class Users(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    email_address = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(255), nullable=False)
    profile_photo = db.Column(db.Text, nullable=True, default="default.png")
    user_bio = db.Column(db.String(255), nullable=True, default="None")

    def to_dict(self):
        """Convert the user object to a dictionary."""
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email_address": self.email_address,
            "role": self.role,
            "profile_photo": self.profile_photo,
            "user_bio": self.user_bio if self.user_bio else "None"
        }


# ------------------ Init ------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
