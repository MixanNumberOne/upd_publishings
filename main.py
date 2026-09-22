#!/usr/bin/env -S .venv/bin/python

from flask import Flask, jsonify, render_template, send_from_directory
import re, os

app = Flask(__name__)

PANELS_CONFIG = {
    "title": "Мои панели",
    "panels": []
}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/dbs")
def get_panels():
    files = [f for f in os.listdir("./databases") if re.search(r"\.xlsx?$", f, re.IGNORECASE)]
    files.sort()
    PANELS_CONFIG["panels"] = files
    return jsonify(PANELS_CONFIG)


@app.route("/databases/<path:filename>")
def serve_db_file(filename):
    """Отдаёт исходный xls/xlsx файл — парсинг делает браузер (SheetJS)."""
    return send_from_directory("./databases", filename)


if __name__ == "__main__":
    app.run(debug=True)