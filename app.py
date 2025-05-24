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
            "password": self.password,
            "role": self.role,
            "profile_photo": self.profile_photo,
            "user_bio": self.user_bio if self.user_bio else "None"
        }


# ------------------ API Routes ------------------

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    bio = data.get("bio")
    profile_base64 = data.get("profile_photo")

    if not all([username, email, password, confirm_password]):
        return jsonify({"status": "danger", "message": "All fields required."}), 400
    if password != confirm_password:
        return jsonify({"status": "danger", "message": "Passwords do not match."}), 400
    if Users.query.filter_by(username=username).first():
        return jsonify({"status": "danger", "message": "Username already exists."}), 400
    if Users.query.filter_by(email_address=email).first():
        return jsonify({"status": "danger", "message": "Email already exists."}), 400

    # Handle profile photo
    profile_filename = "default.png"
    if profile_base64:
        try:
            header, encoded = profile_base64.split(",", 1)
            ext = header.split("/")[1].split(";")[0]
            image_data = base64.b64decode(encoded)
            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            profile_filename = f"{username}_{timestamp}.{ext}"
            image_path = os.path.join("static", "images", profile_filename)
            os.makedirs(os.path.dirname(image_path), exist_ok=True)
            with open(image_path, "wb") as f:
                f.write(image_data)
        except Exception as e:
            return jsonify({"status": "danger", "message": "Invalid image format."}), 400

    new_user = Users(
        username=username,
        email_address=email,
        password=generate_password_hash(password),
        profile_photo=profile_filename,
        user_bio=bio,
        role="user"
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"status": "success", "message": "Registration complete!"})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = Users.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        session["user_id"] = user.user_id
        session["username"] = user.username
        return jsonify({"status": "success", "message": f"Welcome {user.username}!"})

    return jsonify({"status": "danger", "message": "Invalid credentials."}), 401


# ------------------ Init ------------------

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
