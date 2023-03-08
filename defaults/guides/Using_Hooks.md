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
<br/>
**Flags:** <br/>
(-h) hook_name - "Log In" <br/>
(-u) username - The username of the user. <br/>
(-t) time - The time that the user logged in at.
<br/>
<br/>

#### Log Out
Run whenever a user logs out of the steamdeck.
<br/>
**Flags:** <br/>
(-h) hook_name - "Log Out" <br/>
(-u) username - The username of the user. <br/>
(-t) time - The time that the user logged out at.
<br/>
<br/>

#### Game Start
Run whenever a game is started.
<br/>
**Flags:** <br/>
(-h) hook_name - "Game Start" <br/>
(-i) game_id - The id of the game that was started. <br/>
(-n) game_name - The name of the game that was started.
<br/>
<br/>

#### Game End
Run whenever a game ends.
<br/>
**Flags:** <br/>
(-h) hook_name - "Game End" <br/>
(-i) game_id - The id of the game that was ended. <br/>
(-n) game_name - The name of the game that was ended.
<br/>
<br/>

#### Game Install
Run whenever a game is installed.
<br/>
**Flags:** <br/>
(-h) hook_name - "Game Install" <br/>
(-i) game_id - The id of the game that was installed. <br/>
(-n) game_name - The name of the game that was installed.
<br/>
<br/>

#### Game Uninstall
Run whenever a game is uninstalled.
<br/>
**Flags:** <br/>
(-h) hook_name - "Game Uninstall" <br/>
(-i) game_id - The id of the game that was uninstalled. <br/>
(-n) game_name - The name of the game that was uninstalled.
<br/>
<br/>

#### Game Achievement Unlock
Run whenever an achievement is unlocked in a game.
<br/>
**Flags:** <br/>
(-h) hook_name - "Game Achievement Unlock" <br/>
(-i) game_id - The id of the current game. <br/>
(-n) game_name - The name of the current game. <br/>
(-a) achievement_name - The name of the unlocked achievement <br/>
(-t) time - The time the achievement was unlocked at.
<br/>
<br/>

#### Screenshot Taken
Run whenever a screenshot is taken.
<br/>
**Flags:** <br/>
(-h) hook_name - "Game Achievement Taken" <br/>
(-i) game_id - The id of the current game. <br/>
(-n) game_name - The name of the current game. <br/>
(-p) path - The path to the screenshot. <br/>
(-t) time - The time the achievement was unlocked at.
<br/>
<br/>

#### Message Recieved
Run whenever a chat message is recieved.
<br/>
**Flags:** <br/>
(-h) hook_name - "Message Recieved" <br/>
(-f) from - The name of the user the message is from. <br/>
(-c) content - The content of the message. 
<br/>
<br/>

#### SteamOS Update Available
Run whenever a new SteamOS update is available for the current channel.
<br/>
**Flags:** <br/>
(-h) hook_name - "SteamOS Update Available" <br/>
(-l) channel - The current update channel. <br/>
(-v) version - The update's version. 
<br/>
<br/>

#### Deck Sleep
Run before the Deck goes to sleep.
<br/>
**Flags:** <br/>
(-h) hook_name - "Deck Sleep"
<br/>
<br/>

#### Deck Shutdown
Run before the Deck shuts down.
<br/>
**Flags:** <br/>
(-h) hook_name - "Deck Shutdown"
<br/>
<br/>
<br/>

###### © Travis Lane (Tormak)