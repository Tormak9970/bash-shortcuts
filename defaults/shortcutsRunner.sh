#!/bin/bash

eval "$@"

preppedWindowDimensions=$(xrandr --current | grep -oP '/(?<=(current )).*(?=[\,])/i')
IFS=' ' read -r -a windowDimensions <<< $preppedWindowDimensions
SCREEN_WIDTH="${windowDimensions[0]}"
SCREEN_HEIGHT="${windowDimensions[2]}"

xdotool windowsize :ACTIVE: $SCREEN_WIDTH $SCREEN_HEIGHT