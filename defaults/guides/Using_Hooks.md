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
Hooks are a more complex way to run your shortcuts, and allow you to automate running them. By adding a hook to a shortcut, it will be run each time the hook's associated event occurs, and will be passed the flags for the hook event (**IMPORTANT:** You need to turn on pass flags in the shortcut's settings, otherwise it will be given no flags).

<br/>

### Global Flags
There are a few flags that are passed to all non app shortcuts wthat take flags. These are:
| Flag   | Value     |
| :----: | :-------- |
| -t     | The time the shortcut was run at |
| -d     | The date the shortcut was run on |
| -u     | The username of the current user |

<br/>

### Current Game Flags
These flags are passed when you are on a game's library page or it is running. <br/>
**Note:** that these are not passed for game related hooks since those hooks set the same flags
| Flag   | Value     |
| :----: | :-------- |
| -i     | The current game's appId |
| -n     | The current game's name |

<br/>

### Hookable Events
Listed below are all the different hookable events. Each hook has a description of when it occurs, and what flag(s) it will provide your shortcut with (in addition to the global flags). These flags can be accessed by checking for them in your script, as well as a flag containing the hook name. Scan the QR code below or click [here](https://linuxconfig.org/bash-script-flags-usage-with-arguments-examples) to learn more:

<img title="Bash Flags Reference QR Code" src="https://raw.githubusercontent.com/tormak9970/bash-shortcuts/master/assets/bash-flags-ref-qrcode.png" width=178 height = 178 />

<br/>

#### Log In
Run whenever a user logs into the steamdeck.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Log In" |

#### Log Out
Run whenever a user logs out of the steamdeck.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Log Out" |

#### Game Start
Run whenever a game is started.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Game Start" |
| -i     | The id of the game that was started |
| -n     | The name of the game that was started |

#### Game End
Run whenever a game ends.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Game End" |
| -i     | The id of the game that was ended |
| -n     | The name of the game that was ended |

#### Game Install
Run whenever a game is installed.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Game Install" |
| -i     | The id of the game that was installed |
| -v     | The version of the game that was installed |
| -n     | The name of the game that was installed |

#### Game Update
Run whenever a game is updated.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Game Update" |
| -i     | The id of the game that was updated |
| -n     | The name of the game that was updated |
| -v     | The version the game that was updared to |

#### Game Uninstall
Run whenever a game is uninstalled.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Game Uninstall" |
| -i     | The id of the game that was uninstalled |
| -n     | The name of the game that was uninstalled |

#### Game Achievement Unlock
Run whenever an achievement is unlocked in a game.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Game Achievement Unlock" |
| -i     | The id of the current game |
| -n     | The name of the current game |
| -a     | The name of the unlocked achievement |

#### Screenshot Taken
Run whenever a screenshot is taken.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Screenshot Taken" |
| -i     | The id of the current game |
| -n     | The name of the current game |
| -p     | The path to the screenshot |

#### Deck Sleep
Run before the Deck goes to sleep.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Deck Sleep" |

#### Deck Shutdown
Run before the Deck shuts down.

| Flag   | Value     |
| :----: | :-------- |
| -h     | "Deck Shutdown" |

<br/>

###### © Travis Lane (Tormak)