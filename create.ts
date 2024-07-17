#!/usr/bin/node
/** @format */

import { exec } from 'node:child_process';
import { createInterface } from 'node:readline';
import * as fs from 'node:fs';
import path from 'node:path';

async function main() {
	process.chdir('/home/anton/.local/share/applications');

	//const directories = fs.readdirSync(process.cwd());

	//console.info(directories);

	const args = process.argv.slice(2);

	//console.info(args);

	if (args.length == 0 || args.includes('--help') || args.includes('-h')) {
		console.info(
			`USAGE: ${path.basename(process.argv[1])} <program> [-n NAME] [-t]`
		);
		console.info('Create a .desktop entry for a program');
		console.log();
		console.info('Options:');
		console.info(
			'-n, --name - The display name of the desktop entry [default: program]'
		);
		console.info('-t, --terminal - Mark desktop entry as a terminal program');
		console.info('-h, --help - Display this help page');

		process.exit(1);
	}

	let opts = {
		program: args[0],
		name: null as string | null,
		terminal: false,
	};

	for (let i = 1; i < args.length; i++) {
		const curr = args[i];
		const next = args[i + 1];

		if (curr === '-n' || curr === '--name') {
			if (!next || next.startsWith('-')) {
				console.error(
					`Option 'name' (${curr}) requires 1 positional narg, NAME. Cannot start with a hyphen (-)`
				);
				process.exit(1);
			}
			opts.name = next;
		}

		if (curr === '-t' || curr === '--terminal') {
			opts.terminal = true;
		}
	}

	opts.name = opts.name ?? opts.program.toLowerCase();

	type nstring = string | null;

	let executable: nstring | Promise<nstring> = new Promise((r) => {
		exec(`which ${opts.program}`, (err, stdout) => {
			if (err) {
				console.error(err);
				r(null);
			}
			r(stdout);
		});
		setTimeout(() => r(null), 2000);
	});

	executable.then((path) => (executable = path));

	await executable;

	if (!executable) {
		console.error(`Could not discover '${opts.program}'!`);
		process.exit(1);
	}

	executable = executable as unknown as string;

	const target = `[Desktop Entry]
Encoding=UTF-8
Version=1.0
Name=${opts.name}
Terminal=${opts.terminal}
Exec=${executable.trim()}
Type=Application`;

	console.info(`Writing ${opts.name.toLowerCase()}.desktop:`);
	console.info('   ' + target.split('\n').join('\n   '));

	if (!(await prompt('Confirm?'))) {
		console.info('Aborted');

		process.exit(0);
	}

	try {
		fs.readFileSync('./' + opts.name.toLowerCase() + '.desktop', {
			flag: 'r',
		});

		console.warn(`File for ${opts.name} already exists!`);
		if (!(await prompt('Overwrite?'))) {
			console.info('Aborted');

			process.exit(0);
		}
	} catch {}

	fs.writeFileSync(`./${opts.name.toLowerCase()}.desktop`, target);

	console.info('Done!');

	process.exit(0);
}

async function prompt(msg: string): Promise<boolean> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	let confirmation: boolean | Promise<boolean> = new Promise((r) => {
		rl.question(msg + ' [(Y)es/(N)o] (Default: N) > ', (answer) => {
			const lower = answer.toLowerCase();
			rl.close();
			if (lower === 'y' || lower === 'yes') r(true);
			r(false);
		});
	});

	confirmation.then((selected) => (confirmation = selected));

	return await confirmation;
}

main();
