## Using Hooks
<br/>

### Table of Contents
 - Overview
 - Hookable Events
   - Log In
   - Log Out
   - Game Start
   - Game End
   - Game Install
   - Game Uninstall
   - Game Achievement Unlock
   - Screenshot Taken
   - Message Recieved
   - SteamOS Update Available
   - Deck Shutdown
   - Deck Sleep
<br/>
<br/>

### Overview
Hooks are a more complex way to run your shortcuts, and allow you to automate running shortcuts. By adding a hook to a shortcut, it will be run each time the hook's associated event occurs, and will be passed the arguments for the hook event.
<br/>
<br/>
<br/>

### Hookable Events
Listed below are all the different hookable events. Each hook has a description of when it occurs, and what flag(s) it will provide your shortcut with. These flags can be accessed by checking for them in your script, as well as a flag containing the hook name. Scan the QR code below or click [here](https://linuxconfig.org/bash-script-flags-usage-with-arguments-examples) to learn more:

<img title="Bash Flags Reference QR Code" src="https://raw.githubusercontent.com/tormak9970/bash-shortcuts/master/defaults/guides/images/bash-flags-ref-qrcode.png" width=178 height = 178 />
<br/>
<br/>

#### Log In
Run whenever a user logs into the steamdeck.

| Flag | Value    |
| ---- | -------- |
| -h   | "Log In" |
| -u   | The username of the user |
| -t   | The time that the user logged in at |

<br/>

#### Log Out
Run whenever a user logs out of the steamdeck.

| Flag | Value    |
| ---- | -------- |
| -h   | "Log Out" |
| -u   | The username of the user |
| -t   | The time that the user logged out at |

<br/>

#### Game Start
Run whenever a game is started.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Start" |
| -i   | The id of the game that was started |
| -n   | The name of the game that was started |

<br/>

#### Game End
Run whenever a game ends.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game End" |
| -i   | The id of the game that was ended |
| -n   | The name of the game that was ended |

<br/>

#### Game Install
Run whenever a game is installed.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Install" |
| -i   | The id of the game that was installed |
| -n   | The name of the game that was installed |

<br/>

#### Game Uninstall
Run whenever a game is uninstalled.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Uninstall" |
| -i   | The id of the game that was uninstalled |
| -n   | The name of the game that was uninstalled |

<br/>

#### Game Achievement Unlock
Run whenever an achievement is unlocked in a game.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Achievement Unlock" |
| -i   | The id of the current game |
| -n   | The name of the current game |
| -a   | The name of the unlocked achievement |
| -t   | The time the achievement was unlocked at |

<br/>

#### Screenshot Taken
Run whenever a screenshot is taken.

| Flag | Value    |
| ---- | -------- |
| -h   | "Screenshot Taken" |
| -i   | The id of the current game |
| -n   | The name of the current game |
| -p   | The path to the screenshot |
| -t   | The time the screenshot was taken at |

<br/>

#### Message Recieved
Run whenever a chat message is recieved.

| Flag | Value    |
| ---- | -------- |
| -h   | "Message Recieved" |
| -f   | The name of the user the message is from |
| -c   | The content of the message|

<br/>

#### SteamOS Update Available
Run whenever a new SteamOS update is available for the current channel.

| Flag | Value    |
| ---- | -------- |
| -h   | "SteamOS Update Available" |
| -l   | The current update channel |
| -v   | The update's version number

<br/>

#### Deck Sleep
Run before the Deck goes to sleep.

| Flag | Value    |
| ---- | -------- |
| -h   | "Deck Sleep" |

<br/>

#### Deck Shutdown
Run before the Deck shuts down.

| Flag | Value    |
| ---- | -------- |
| -h   | "Deck Shutdown" |

<br/>

###### © Travis Lane (Tormak)