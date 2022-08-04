const Converter = require('../converter/converter');

class Timeslot {
	constructor({ id, start_date=null, end_date=null, paused, pause_time_ms=0, timezone, tags=[] }={}) {
		this.id = id;
		this.tags = tags;
		this.start_date = start_date || new Date().toISOString();  // ensures UTC format
		this.end_date = end_date;
		this.timezone = timezone;

		this.paused = paused;
		this.pause_time_ms = pause_time_ms;
	}

	end() {
		this.end_date = new Date().toISOString();
	}

	pause() {
		if(this.paused) {
			return;
		}

		this.paused = new Date().toISOString();
	}

	resume() {
		if(!this.paused) {
			return;
		}

		const now = Date.now();
		const then = new Date(this.paused);
		const paused_time = now - then;
		this.pause_time_ms += paused_time;
		this.paused = null;
	}

	length({ from }={}) {
		const raw_time_ms = new Date(from || this.end_date).getTime() - new Date(this.start_date).getTime();
		const real_time_ms = raw_time_ms - this.pause_time_ms;
		return real_time_ms;
	}

	valueOf() {
		return this.hours;
	}
}

module.exports = { Timeslot };
