#!/usr/bin/node
/** @format */

import { spawn, exec } from 'child_process';
import { homedir } from 'os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { writeFileSync } from 'fs';

process.chdir('/home/anton/.local/share/applications');

const apps = fs.readdirSync(process.cwd());

let options: string[] = [];
let execs: string[] = [];

apps.forEach((app) => {
	const open = fs.readFileSync(app, { flag: 'r' }).toString();
	let data = {
		name: null as string | null,
		exec: null as string | null,
	};

	for (let line of open.split('\n')) {
		const [key, value] = line.split('=').map((value) => value.trim());
		if (!value) continue;
		if (key === 'Name') {
			if (data.name) {
				console.error('Invalid app:', app);
				console.warn('Duplicate name key');
			}
			data.name = value;
		}
		if (key === 'Exec') {
			if (data.exec) {
				console.error('Invalid app:', app);
				console.warn('Duplicate executable key');
			}
			data.exec = value;
		}
	}

	if (data.name && data.exec) {
		if (options.includes(data.name)) {
			console.error('Duplicate entry for', data.name, 'in', app);
			return;
		}
		options.push(data.name);
		execs.push(data.exec);
	} else {
		console.error('Invalid app:', app);
		console.warn('Missing information');
	}
});

const fzfCommand = (options: string[]) =>
	`echo "${options.join(',')}" | sed "s/,/\\n/g" | fzf`;

const selected: Promise<string | null> = new Promise((r) => {
	exec(fzfCommand(options), (err, stdout, stderr) => {
		if (err) {
			r(null);
			return;
		}
		if (stderr) {
			console.error('STDERR: ' + stderr);
			return;
		}

		r(stdout);
	});
});

// launch selected
selected.then((opt) => {
	if (!opt) return;
	const index = options.indexOf(opt.trim());

	if (index == -1) return;

	const name = options[index].toLowerCase();
	const log = fs.openSync(path.join(homedir(), '.launch', name + '.log'), 'w');

	writeFileSync(
		log,
		`${path.basename(process.argv[1])}: STARTING INSTANCE OF ${name} (at ${execs[index]})\n$ `.toUpperCase() +
			execs[index] +
			'\n\n'
	);

	const thread = spawn(execs[index], [], {
		detached: true,
		stdio: ['ignore', log, log],
	});

	thread.unref();

	console.info(
		'Started process',
		options[index],
		`(${thread.pid})`,
		'successfully.'
	);

	process.exit();
});
