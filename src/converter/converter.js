const { PunchcardError } = require('../models/errors');

class Converter {
	static ms(from_ms) {
		return from_ms;
	}

	static seconds(from_ms) {
		return from_ms / 1000;
	}

	static hours(from_ms) {
		return this.seconds(from_ms) / 3600;
	}

	static days(from_ms) {
		return this.hours(from_ms) / 24;
	}

	static convert(time_ms, unit='hours') {
		const units = {
			milliseconds: 'ms',
			s: 'seconds',
			h: 'hours',
			d: 'days',
		};

		if(!this[unit] && !this[units[unit]]) {
			throw new PunchcardError(`Unit ${unit} unknown`);
		}

		if(this[unit]) {
			return this[unit](time_ms);
		}

		const _unit = units[unit];
		return this[_unit](time_ms);
	}
}

module.exports = Converter;
