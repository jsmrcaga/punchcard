const path = require('path');
const fs = require('fs/promises');

const { underline, bold } = require('chalk');
const logger = require('../logger/logger');

const Converter = require('../converter/converter');
const { PunchcardError } = require('../models/errors');

const EventEmitter = require('../models/event-emitter');

class Commands extends EventEmitter {
	constructor(manager) {
		super();
		this.manager = manager;
	}

	run(command, { options, variables }) {
		command = command.replace(/-/g, '_');
		if(!this[command]) {
			logger.error(`Command "${command}" not recognized. Use -h to see help`);
			process.exit(1);
		}

		try {
			return this[command]({ options, variables });
		} catch(e) {
			if(e instanceof PunchcardError) {
				logger.error(e.message);
				return process.exit(1);
			}

			throw e;
		}
	}

	start() {
		return this.manager.start().then((timeslot) => {
			logger.success('New timeslot started!');
		});
	}

	resume({ options: { unit='hours' } }) {
		return this.manager.resume().then(timeslot => {
			const length = Converter.convert(timeslot.length({ from: Date.now() }), unit);
			logger.info(`Timeslot resumed, current time is: ${length} ${unit}`);
		});
	}

	end({ options: { unit='hours' } }) {
		return this.manager.end().then(timeslot => {
			const length = Converter.convert(timeslot.length({ from: Date.now() }), unit);
			logger.success(`Ended timeslot at ${length} ${unit}`);
		});
	}

	pause() {
		return this.manager.pause().then(timeslot => {
			logger.warning('Timeslot paused');
		});
	}

	show({ options: { unit='hours' }}) {
		const { current_timeslot } = this.manager;
		if(!current_timeslot) {
			return logger.info('No timeslot in progress');
		}

		const current_length = Math.ceil(
			Converter.convert(current_timeslot.length({ from: Date.now() }), unit)
		);

		return logger.info(`Current timeslot:\n${underline('Started')}: ${logger.format_date(current_timeslot.start_date)}\n${underline('Current length')} (rounded up): ${current_length} ${unit}`);
	}

	length({ options: { from, to, unit='hours', overlap=true, round=true }}) {
		// TODO: add preprocessing to argumentate
		from = new Date(from || 0).getTime();
		to = to ? new Date(to).getTime() : Date.now();

		const from_human = new Date(from).toLocaleString();
		const to_human = new Date(to).toLocaleString();

		return this.manager.length({ from, to, unit, overlap }).then(length => {
			if(round) {
				length = Math.ceil(length);
			}

			return logger.info(`Length from ${underline(from_human)} to ${underline(to_human)} is ${bold(length)} ${unit}`);
		});
	}

	export({ options: { from, to, filename=null, overlap=true, round=true, unit='hours' }}) {
		filename = filename || path.join(process.cwd(), `punchcard-export-${new Date().toISOString()}.csv`);

		from = new Date(from || 0).getTime();
		to = to ? new Date(to).getTime() : Date.now();

		let csv = 'start_date, end_date, paused_time, total_time, unit';

		this.manager.bound({ from, to, overlap }).then(timeslots => {
			// sort by first started
			timeslots.sort((a, b) => {
				return new Date(a) - new Date(b);
			});

			for(const timeslot of timeslots) {
				const paused_time = Converter.convert(timeslot.pause_time_ms, unit);
				const total_time = Converter.convert(timeslot.length(), unit);
				csv += `\n${timeslot.start_date}, ${timeslot.end_date}, ${paused_time}, ${total_time}, ${unit}`;
			}

			return fs.writeFile(filename, csv).then(() => csv);
		}).then((csv) => {
			this.emit('export', { filename, content: csv });
		});
	}

	export_month({ options={} }) {
		const this_month = new Date();
		this_month.setDate(1);
		this_month.setHours(0, 0, 0, 0);

		return this.export({
			options: {
				filename: path.join(process.cwd(), `./punchcard-export-month-${this_month.getFullYear()}-${this_month.getMonth() + 1}.csv`),
				from: this_month,
				to: new Date(),
				...options
			}
		});
	}
}


module.exports = Commands;
