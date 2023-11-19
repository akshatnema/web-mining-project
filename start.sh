#! /bin/sh

echo 'Starting the script'

node script.js
. "venv/bin/activate"
python3 analyse.py
