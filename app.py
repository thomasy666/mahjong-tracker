from flask import Flask, render_template, request, redirect, url_for, flash, session
from tracker import MahjongTracker
from translations import translations
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'mahjong_secret_key'  # Needed for flash messages
UPLOAD_FOLDER = 'static/avatars'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(os.path.join(app.root_path, UPLOAD_FOLDER), exist_ok=True)

# Initialize the game instance
game = MahjongTracker()

# Add default players only if no data was loaded
if not game.players:
    game.add_player("Player 1")
    game.add_player("Player 2")
    game.add_player("Player 3")
    game.add_player("Player 4")

@app.context_processor
def inject_translations():
    lang = session.get('lang', 'en')
    return dict(t=translations[lang], lang_code=lang, 
                is_locked=game.is_player_locked, 
                admin_mode=session.get('admin_mode', False))

def flash_msg(category, key, **kwargs):
    lang = session.get('lang', 'en')
    t_dict = translations.get(lang, translations['en'])
    msg = t_dict.get(key, key)
    try:
        msg = msg.format(**kwargs)
    except Exception:
        pass # If formatting fails, show the raw message/key
    flash(msg, category)

def check_admin_auth(provided_code):
    if session.get('admin_mode'):
        return True
    return game.verify_admin_code(provided_code)

@app.route('/admin/login', methods=['POST'])
def admin_login():
    code = request.form.get('admin_code')
    if game.verify_admin_code(code):
        session['admin_mode'] = True
        flash_msg("success", "flash_admin_mode_enabled")
    else:
        flash_msg("danger", "flash_invalid_admin")
    return redirect(request.referrer or url_for('index'))

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_mode', None)
    flash_msg("info", "flash_admin_mode_disabled")
    return redirect(request.referrer or url_for('index'))

@app.route('/set_language/<lang_code>')
def set_language(lang_code):
    if lang_code in translations:
        session['lang'] = lang_code
    return redirect(request.referrer or url_for('index'))

@app.route('/')
def index():
    standings = game.get_standings()
    ledger = game.get_ledger()
    
    # Identify all players who have ever participated to form table columns
    history_players = set(game.players.keys())
    for round_data in ledger:
        history_players.update(round_data['deltas'].keys())
    
    # Order: Current players first (by rank), then historical players
    current_names = [p for p, _, _ in standings]
    historical_only = sorted(list(history_players - set(current_names)))
    history_headers = current_names + historical_only

    return render_template('index.html', 
                           standings=standings, 
                           ledger=ledger, 
                           players=game.players, 
                           history_headers=history_headers,
                           player_colors=game.player_colors,
                           player_avatars=game.player_avatars,
                           statistics=game.get_statistics())

@app.route('/add_round', methods=['POST'])
def add_round():
    deltas = {}
    try:
        # Iterate through submitted form keys to find player inputs
        for key, value in request.form.items():
            if key.startswith('score_'):
                player_name = key.replace('score_', '')
                # Only include non-empty inputs (or default to 0)
                score_val = int(value) if value else 0
                deltas[player_name] = score_val
        
        # If no scores entered or empty dict (e.g. no players)
        if not deltas:
             flash_msg("warning", "flash_no_scores")
             return redirect(url_for('index'))

        # Handle Recorder Identity Locking
        locked_recorder = session.get('recorder_name')
        if locked_recorder:
            # If locked, force the recorder name from session
            recorder_name = locked_recorder
        else:
            # If not locked, get from form and lock it for next time
            recorder_name = request.form.get('recorder_name', 'Unknown')
            if recorder_name != 'Unknown':
                session['recorder_name'] = recorder_name
        
        ip_address = request.remote_addr
        
        game.add_round(deltas, recorder_name=recorder_name, ip_address=ip_address)
        flash_msg("success", "flash_round_recorded")
    except ValueError as e:
        if e.args and isinstance(e.args[0], str):
            key = e.args[0]
            params = e.args[1] if len(e.args) > 1 else {}
            flash_msg("danger", key, **params)
        else:
            flash(str(e), "danger")
    
    return redirect(url_for('index'))

@app.route('/change_recorder', methods=['POST'])
def change_recorder():
    admin_code = request.form.get('admin_code')
    if check_admin_auth(admin_code):
        session.pop('recorder_name', None)
        flash_msg("success", "flash_recorder_unlocked")
    else:
        flash_msg("danger", "flash_invalid_admin")
    return redirect(url_for('index'))

@app.route('/undo', methods=['POST'])
def undo():
    admin_code = request.form.get('admin_code')
    if check_admin_auth(admin_code):
        if game.undo_last_round():
            flash_msg("info", "flash_round_undone")
        else:
            flash_msg("warning", "flash_nothing_undo")
    else:
        flash_msg("danger", "flash_invalid_admin")
    return redirect(url_for('index'))

@app.route('/players/add', methods=['POST'])
def add_player():
    name = request.form.get('name')
    if name:
        try:
            game.add_player(name)
            flash_msg("success", "flash_player_added", name=name)
        except ValueError as e:
            if e.args and isinstance(e.args[0], str):
                key = e.args[0]
                params = e.args[1] if len(e.args) > 1 else {}
                flash_msg("danger", key, **params)
            else:
                flash(str(e), "danger")
    return redirect(url_for('index'))

@app.route('/players/remove', methods=['POST'])
def remove_player():
    name = request.form.get('name')
    admin_code = request.form.get('admin_code')
    if name:
        if game.is_player_locked(name) and not check_admin_auth(admin_code):
            flash_msg("danger", "flash_player_locked", name=name)
        else:
            game.remove_player(name)
            flash_msg("warning", "flash_player_removed", name=name)
    return redirect(url_for('index'))

@app.route('/players/rename', methods=['POST'])
def rename_player():
    old_name = request.form.get('old_name')
    new_name = request.form.get('new_name')
    
    if old_name and new_name:
        try:
            game.rename_player(old_name, new_name)
            if session.get('recorder_name') == old_name:
                session['recorder_name'] = new_name
            flash_msg("success", "flash_player_renamed", old_name=old_name, new_name=new_name)
        except ValueError as e:
            if e.args and isinstance(e.args[0], str):
                key = e.args[0]
                params = e.args[1] if len(e.args) > 1 else {}
                flash_msg("danger", key, **params)
            else:
                flash(str(e), "danger")
    return redirect(url_for('index'))

@app.route('/players/color', methods=['POST'])
def change_player_color():
    name = request.form.get('name')
    color = request.form.get('color')
    
    if name and color:
        try:
            game.set_player_color(name, color)
            flash_msg("success", "flash_player_color_changed", name=name)
        except ValueError as e:
            if e.args and isinstance(e.args[0], str):
                key = e.args[0]
                params = e.args[1] if len(e.args) > 1 else {}
                flash_msg("danger", key, **params)
            else:
                flash(str(e), "danger")
    return redirect(url_for('index'))

@app.route('/players/avatar', methods=['POST'])
def change_player_avatar():
    name = request.form.get('name')
    if 'avatar' not in request.files:
        # flash_msg("warning", "flash_no_file")
        return redirect(url_for('index'))
    
    file = request.files['avatar']
    if file.filename == '':
        # flash_msg("warning", "flash_no_file")
        return redirect(url_for('index'))
        
    if file and name:
        filename = secure_filename(f"{name}_{file.filename}")
        file.save(os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], filename))
        try:
            game.set_player_avatar(name, filename)
            flash_msg("success", "flash_avatar_updated", name=name)
        except ValueError as e:
            flash(str(e), "danger")
            
    return redirect(url_for('index'))

@app.route('/reset', methods=['POST'])
def reset():
    admin_code = request.form.get('admin_code')
    if check_admin_auth(admin_code):
        game.reset_game()
        flash_msg("info", "flash_game_reset")
    else:
        flash_msg("danger", "flash_invalid_admin")
    return redirect(url_for('index'))


@app.route('/settings/admin', methods=['POST'])
def update_admin_code():
    old_code = request.form.get('old_code')
    new_code = request.form.get('new_code')
    try:
        game.set_admin_code(old_code, new_code)
        flash_msg("success", "flash_admin_updated")
    except ValueError as e:
        if e.args and isinstance(e.args[0], str):
            key = e.args[0]
            params = e.args[1] if len(e.args) > 1 else {}
            flash_msg("danger", key, **params)
        else:
            flash(str(e), "danger")
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
