#!/usr/bin/env node
const path = require('path');
const os = require('os');

const logger = require('../logger/logger');

const { options, variables } = require('argumentate')({
	args: process.argv.slice(2),
	config: {
		name: 'Punchcard',
		command: 'punchcard'
	},
	mapping: {
		c: {
			key: 'config',
			help: 'Configuration file location'
		},
		s: {
			key: 'start',
			help: 'Start a new timeslot or resume current timeslot'
		},
		e: {
			key: 'end',
			help: 'End the current timeslot'
		},
		p: {
			key: 'pause',
			help: 'pause the current timeslot'
		},
		m: {
			key: 'export-month',
			help: `Export this month's timelslots to CSV file`
		},
		u: {
			key: 'unit',
			help: 'What unit to show, can be s (or seconds), ms (or milliseconds), h (or hours), and d (or days)'
		},
		f: {
			key: 'from',
			help: 'When bounding dates, the starting date to fetch timeslots'
		},
		t: {
			key: 'to',
			help: 'When bounding dates, the ending date to fetch timeslots'
		},
		r: {
			key: 'round',
			help: 'Round up (Math.ceil)'
		},
		o: {
			key: 'filename',
			help: 'When exporting, filename to use'
		}
	}
});

const Commands = require('./commands');

// Let's read the config immediately after requiring the file
// that way next imports will have the config in cache
const Config = require('../config/config');


const home_config = path.join(os.homedir(), './punchcard.config.js');
Config.read(options.config || home_config).then((config) => {
	const DB = require('../data/db');
	return DB.connect();
}).then(() => {
	const { Manager } = require('../models/manager');
	return Manager.load();
}, (err) => {
	console.error(err);
	process.exit(1);
}).then(manager => {
	const { event_listeners = {} } = Config;

	manager.apply_listeners(event_listeners);
	// Do something CLI related
	const commands = new Commands(manager);
	commands.apply_listeners(event_listeners);

	const command = variables.shift();
	if(!command) {
		return logger.error('No command supplied. Use -h to show help');
	}

	commands.run(command, { options, variables });
});
