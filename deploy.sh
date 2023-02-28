#!/bin/bash

deck_ip=""
deck_port=""
deck_pass=""
deck_ssh_key=""
deck_home_dir=""

echo "[INFO]: Deploying plugin to deck..."
echo ""
echo "[TASK]: Loading config..."

unclean_output=$(cat ./.vscode/settings.json)
echo $unclean_output
prepped_output="${unclean_output//[\s\{\}\"]/""}"
echo $prepped_output

echo "[DONE]"