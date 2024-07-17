<!-- @format -->

# arch-launch

Minimalistic application launcher for Linux powered by FZF using .desktop files.

## Requirements

- fzf (any version should suffice)
- Node.js (>v18)

## Installation

1. Clone the repository

```bash
$ git clone --depth=1 https://github.com/antonw51/arch-launch.git
```

2. Build the scripts

```bash
$ cd arch-launch
$ npm i
$ tsc -b
```

3. Sym-link the executables into your `/usr/bin` folder

```bash
$ sudo ln ./arch-launch/create.js /usr/bin/cdesk
$ sudo ln ./arch-launch/launch.js /usr/bin/ldesk
```

## Usage

Use the `cdesk` utility to _create_ applications launchable by `ldesk`:

```bash
$ cdesk brave -n Brave
```

```bash
$ cdesk -h
USAGE: cdesk <program> [-n NAME] [-t]
Create a .desktop entry for a program

Options:
-n, --name - The display name of the desktop entry [default: program]
-t, --terminal - Mark desktop entry as a terminal program
-h, --help - Display this help page
```

Use the `ldesk` utility to launch a program interactively with `fzf`.

> [!NOTE]
> When called using `ldesk`, the application output can be viewed at `~/.launch`
