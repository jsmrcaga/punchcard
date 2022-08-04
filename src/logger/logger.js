const { bold, red, green, blue, yellow} = require('chalk');

class Logger {
	info(...args) {
		const icon = bold(blue(`ℹ`));
		this.log(icon, ...args);
	}

	error(...args) {
		const icon = bold(red(`✖`));
		this.log(icon, ...args);
	}

	success(...args) {
		const icon = bold(green(`✔`));
		this.log(icon, ...args);
	}

	warning(...args) {
		const icon = bold(yellow(`⚠`));
		this.log(icon, ...args);
	}

	log(...args) {
		console.log('\n', ...args, '\n');
	}


	format_date(isostring) {
		let [locale] = process.env.LANG.split('.') || 'en-GB';
		locale = locale.replace('_', '-');

		const formatter = new Intl.DateTimeFormat(locale,{ dateStyle: 'long', timeStyle: 'short' });
		return formatter.format(new Date(isostring));
	}
}

const logger = new Logger();

module.exports = logger;
