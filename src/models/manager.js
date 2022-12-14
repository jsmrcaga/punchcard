const Converter = require('../converter/converter');
const { PunchcardError } = require('./errors');
const DB = require('../data/db');

const EventEmitter = require('./event-emitter');
const { Timeslot } = require('./timeslot');

class Manager extends EventEmitter {
	constructor({ timeslots, current_timeslot }) {
		super();
		this.timeslots = timeslots;
		this.current_timeslot = current_timeslot;		
	}


	// Management methods
	pause() {
		if(!this.current_timeslot) {
			throw new PunchcardError('No timeslot in progress');
		}

		this.current_timeslot.pause();
		return DB.update(this.current_timeslot).then(() => {
			this.emit('pause', this.current_timeslot);
			return this.current_timeslot;
		});
	}

	start() {
		if(this.current_timeslot) {
			throw new PunchcardError('Timeslot in progress');
		}
		
		this.current_timeslot = new Timeslot();
		return DB.insert(this.current_timeslot).then(() => {
			this.emit('start', this.current_timeslot);
			return this.current_timeslot;
		});
	}

	resume() {
		if(!this.current_timeslot) {
			throw new PunchcardError('No timeslot in progress');
		}

		this.current_timeslot.resume();
		return DB.update(this.current_timeslot).then(() => {
			this.emit('resume', this.current_timeslot);
			return this.current_timeslot;
		});
	}

	end() {
		if(!this.current_timeslot) {
			throw new PunchcardError('No timeslot in progress');
		}

		this.current_timeslot.end();
		return DB.update(this.current_timeslot).then(() => {
			const t = this.current_timeslot;
			this.current_timeslot = null;
			this.emit('end', t);
			return t;
		});
	}

	bound({ from, to, overlap=true }) {
		return DB.get_bound({ from, to, include_overlap: overlap });
	}

	length({ from, to, unit='hours', overlap }) {
		return this.bound({ from, to, overlap }).then(timeslots => {
			const bound_time_ms = timeslots.reduce((agg, timeslot) => {
				const start = new Date(timeslot.start_date).getTime();
				const end = new Date(timeslot.end_date).getTime();
				// This ensures we don't count above or below bounds
				return Math.min(end - start, end - from, to - start, to - from) + agg - timeslot.pause_time_ms;
			}, 0);

			return Converter.convert(bound_time_ms, unit);
		});
	}

	static load(){
		return DB.get_all().then(timeslots => {
			timeslots = timeslots.map(slot => new Timeslot(slot));
			const current_timeslot = timeslots.find(slot => slot.end_date === null);
			return new this({
				timeslots,
				current_timeslot,
			});
		});
	}
}

module.exports = { Manager };
