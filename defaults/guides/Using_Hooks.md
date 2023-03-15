## Using Hooks

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

### Overview
Hooks are a more complex way to run your shortcuts, and allow you to automate running shortcuts. By adding a hook to a shortcut, it will be run each time the hook's associated event occurs, and will be passed the arguments for the hook event.
<br/>

### Hookable Events
Listed below are all the different hookable events. Each hook has a description of when it occurs, and what flag(s) it will provide your shortcut with. These flags can be accessed by checking for them in your script, as well as a flag containing the hook name. Scan the QR code below or click [here](https://linuxconfig.org/bash-script-flags-usage-with-arguments-examples) to learn more:

<img title="Bash Flags Reference QR Code" src="https://raw.githubusercontent.com/tormak9970/bash-shortcuts/master/assets/bash-flags-ref-qrcode.png" width=178 height = 178 />

#### Log In
Run whenever a user logs into the steamdeck.

| Flag | Value    |
| ---- | -------- |
| -h   | "Log In" |
| -u   | The username of the user |
| -t   | The time that the user logged in at |
| -d   | The date that the user logged in on |

#### Log Out
Run whenever a user logs out of the steamdeck.

| Flag | Value    |
| ---- | -------- |
| -h   | "Log Out" |
| -u   | The username of the user |
| -t   | The time that the user logged out at |
| -d   | The date that the user logged out on |

#### Game Start
Run whenever a game is started.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Start" |
| -i   | The id of the game that was started |
| -n   | The name of the game that was started |
| -t   | The time the game was started at |
| -d   | The date the game was started on |

#### Game End
Run whenever a game ends.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game End" |
| -i   | The id of the game that was ended |
| -n   | The name of the game that was ended |
| -t   | The time the game was ended at |
| -d   | The date the game was ended on |

#### Game Install
Run whenever a game is installed.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Install" |
| -i   | The id of the game that was installed |
| -v   | The version of the game that was installed |
| -n   | The name of the game that was installed |
| -t   | The time the game was installed at |
| -d   | The date the game was installed on |

#### Game Update
Run whenever a game is updated.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Update" |
| -i   | The id of the game that was updated |
| -n   | The name of the game that was updated |
| -v   | The version the game that was updared to |
| -t   | The time the game was updated at |
| -d   | The date the game was updated on |

#### Game Uninstall
Run whenever a game is uninstalled.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Uninstall" |
| -i   | The id of the game that was uninstalled |
| -n   | The name of the game that was uninstalled |
| -t   | The time the game was uninstalled at |
| -d   | The date the game was uninstalled on |

#### Game Achievement Unlock
Run whenever an achievement is unlocked in a game.

| Flag | Value    |
| ---- | -------- |
| -h   | "Game Achievement Unlock" |
| -i   | The id of the current game |
| -n   | The name of the current game |
| -a   | The name of the unlocked achievement |
| -t   | The time the achievement was unlocked at |
| -d   | The date the achievement was unlocked on |

#### Screenshot Taken
Run whenever a screenshot is taken.

| Flag | Value    |
| ---- | -------- |
| -h   | "Screenshot Taken" |
| -i   | The id of the current game |
| -n   | The name of the current game |
| -p   | The path to the screenshot |
| -t   | The time the screenshot was taken at |
| -d   | The date the screenshot was taken on |

#### Deck Sleep
Run before the Deck goes to sleep.

| Flag | Value    |
| ---- | -------- |
| -h   | "Deck Sleep" |
| -t   | The time the deck went to sleep at |
| -d   | The date the deck went to sleep on |

#### Deck Shutdown
Run before the Deck shuts down.

| Flag | Value    |
| ---- | -------- |
| -h   | "Deck Shutdown" |
| -t   | The time the deck shutdown at |
| -d   | The date the deck shutdown on |

<br/>

###### © Travis Lane (Tormak)