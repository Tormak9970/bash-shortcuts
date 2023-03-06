#!/bin/bash

eval "$@"

preppedWindowDimensions=$(xrandr --current | grep -oP '/(?<=(current )).*(?=[\,])/i')
IFS=' ' read -r -a windowDimensions <<< $preppedWindowDimensions
SCREEN_WIDTH="${windowDimensions[0]}"
SCREEN_HEIGHT="${windowDimensions[2]}"

# SCREEN_WIDTH=$(xwininfo -root | awk '$1=="Width:" {print $2}')
# SCREEN_HEIGHT=$(xwininfo -root | awk '$1=="Height:" {print $2}')

wmctrl -r :ACTIVE: -b remove,maximized_vert,maximized_horz && wmctrl -r :ACTIVE: -e 0,0,0,$SCREEN_WIDTH,$SCREEN_HEIGHT