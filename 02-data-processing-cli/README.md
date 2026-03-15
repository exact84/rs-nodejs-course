### Data Processing Toolkit.
Interactive command-line application that performs various useful data processing operations. 
The tool should work as a persistent Node.js process that accepts commands.

### CLI Interface
The program is started via npm-script start:
```
npm run start
```

Which runs:
```
node src/main.js
```

The program can:

- Display a welcome message on startup: Welcome to Data Processing CLI!
- Print the current working directory initially: You are currently in /path/to/home
- Continuously prompt the user to enter commands: >
- Accept commands in the format: <command> [arguments]
- Display error messages for unknown or invalid commands without crashing
- Allow users to exit with .exit command or Ctrl+C
- Display a goodbye message on exit: Thank you for using Data Processing CLI!
- After each successful operation, print the current working directory again
- At the start of the program, working directory should be the user's home directory

If a command is unknown, invalid, or has missing required arguments, the program 
print an error message like Invalid input and prompt for a new command.

If an operation fails, the program print Operation failed and prompt for a new command.