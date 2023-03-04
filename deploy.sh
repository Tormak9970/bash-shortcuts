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

function scpDirRecursive() {
  # $1 from dir
  # $2 to dir
  files=($(ls $1))

  for file in "${files[@]}"; do
    if [ -d "$1/$file" ]; then
      scpDirRecursive "$1/$file" "$2/$file"
    else
      diff=$(ssh deck@$deck_ip "cat $2/$file" | diff - $1/$file)

      if [ "$diff" != "" ]; then
        scp -P $deck_port $1/$file deck@$deck_ip:$2/$file
        echo "[INFO]: Copied $1/$file to $2/$file"
      else
        echo "[INFO]: Skipping $1/$file. No changes detected."
      fi
    fi
  done
}

#? Copy general files
echo "[TASK]: Copying general files..."
genFiles=(LICENSE main.py package.json plugin.json README.md)

for genFile in "${genFiles[@]}"; do
  diff=$(ssh deck@$deck_ip "cat $deck_home_dir/$genFile" | diff - $genFile)

  if [ "$diff" != "" ]; then
    # scp -P $deck_port $genFile deck@$deck_ip:$deck_home_dir/$genFile
    echo "[INFO]: Copied ./$genFile to $deck_home_dir/$genFile"
  else
    echo "[INFO]: Skipping $genFile. No changes detected."
  fi
done

#? Copy frontend
echo "[TASK]: Copying frontend..."
scpDirRecursive "./dist" "$deck_home_dir/dist"

#? Copy default files
echo "[TASK]: Copying defaults..."
scpDirRecursive "./defaults" "$deck_home_dir"

echo "[DONE]"