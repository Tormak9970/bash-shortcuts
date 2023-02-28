#!/bin/bash

echo "[TASK]: Loading config..."

unclean_output=$(<.vscode/settings.json)
prepped_output="${unclean_output//[\s\{\}\" ]/""}"

IFS=',:' read -r -a tmps <<< $prepped_output

deck_ip="${tmps[1]}"
deck_port="${tmps[3]}"
deck_home_dir="${tmps[5]}/Desktop/dev-plugins/Shortcuts"

echo "[INFO]: Loaded config"
echo ""
echo "[TASK]: Deploying plugin to deck..."

#? Copy general files
echo "[TASK]: Copying general files..."
genFiles=(LICENSE main.py package.json plugin.json README.md)

for genFile in "${genFiles[@]}"; do
  scp -P $deck_port $genFile deck@$deck_ip:$deck_home_dir/$genFile
  echo "[INFO]: Copied ./$genFile to $deck_home_dir/$genFile"
done

#? Copy frontend
echo "[TASK]: Copying frontend..."
scp -r -P $deck_port /dist deck@$deck_ip:$deck_home_dir/dist
echo "[INFO]: Copied ./dist to $deck_home_dir/dist"

#? Copy default files
echo "[TASK]: Copying defaults..."
files=($(ls ./defaults))

for file in "${files[@]}"; do
  if [ -d $file ]; then
    scp -r -P $deck_port ./defaults/$file deck@$deck_ip:$deck_home_dir/$file
  else
    scp -P $deck_port ./defaults/$file deck@$deck_ip:$deck_home_dir/$file
  fi
  echo "[INFO]: Copied ./defaults/$file to $deck_home_dir/$file"
done

echo "[DONE]"