from flask import Flask, render_template, redirect, request, session

from app.model import user
from . import db
#from .api.auth_api import bp as auth_bp
#from .api.datasets_api import bp as datasets_bp
#from .api.proposals_api import bp as proposals_bp
#from .api.rights_api import bp as rights_bp
#from .api.reports_api import bp as reports_bp

def create_app(config_object='config.Config'):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_object)

    db.init_app(app)

    #app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    #app.register_blueprint(datasets_bp,  url_prefix='/api/datasets')
    #app.register_blueprint(proposals_bp, url_prefix='/api/proposals')
    #app.register_blueprint(rights_bp,    url_prefix='/api/rights')
    #app.register_blueprint(reports_bp,   url_prefix='/api/reports')

    @app.route('/')
    def index():
        return redirect('/login')
    
    @app.get('/login')
    def login():
        return render_template('login.html')
    
    @app.post('/login')
    def login_post():
        from .services.auth_service import AuthService
        auth_service = AuthService(db.get_db())
        username = request.form['username']
        password = request.form['password']
        user = auth_service.login(username, password)
        if user is None:
            return render_template('login.html')
        session.clear()
        session['user_id'] = user.id
        return "login success"
    
    @app.get('/tmpshit')
    def tmpshit():
        if 'user_id' not in session:
            return redirect('/login')
        return render_template('index.html')
    

    return app