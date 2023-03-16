## Custom Scripts

### Table of Contents
 - Overview
 - Scripting in Bash
 - Bash Tips
 - Testing and Debugging
 - Common Issues

<br/>

### Overview
This guide serves to provide tips for writing in bash, and help on some common issues you might run into.

<br/>

### Scripting in Bash
Bash is a common scripting language available natively on linux. It is extremely powerful, and allows you to do pretty much anything you can think of, especially with community packages. There are also loads of resources on how to do various things in bash. Odds are if you have a question, there's either an article or stack overflow post about it.

<br/>

### Bash Tips
There are a couple of tricks I have found are very useful when scripting in bash. 

 - You can store the output of commands in variables using `var=$(YOUR_COMMANDS)`.
 - You can pass the output of one command to another using `COMMAND | COMMAND_THAT_TAKES_INPUT`.
 - You can read flags passed to the script. (**Using Hooks** has more info on that)
 - You can make arrays with `var=(item1 item2 item3 item4 etc)`
 - You can make functions by doing `function myFunction() {}`

For debugging, I recommend testing in desktop mode, and in game mode, change your command to:

 - scripts: `LD_PRELOAD= QT_SCALE_FACTOR=1.25 konsole -e "YOUR_SCRIPT_HERE"`.
 - commands: `LD_PRELOAD= QT_SCALE_FACTOR=1.25 konsole -e /bin/bash --rcfile <(echo "YOUR_COMMAND(s)_HERE")`.

This will launch konsole and then run your shortcut, allowing you to see any error output.
<br/>

### Common Issues:
 - Need sudo permissions - The plugin can't use sudo, so you'll need to find a different solution or remove your sudo password (NOT RECOMMENDED)
 - Shortcut fails immediately - Odds are this is related to your command. check if it might be misspelled or crashing

<br/>

###### © Travis Lane (Tormak)