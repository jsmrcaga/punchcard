const fs = require('fs/promises');
const { DatabseInterface } = require('./interface');
const { Timeslot } = require('../models/timeslot');

class JSONDB extends DatabseInterface {
	constructor({ filename }={}) {
		super();
		this.filename = filename;
		// for now data = { timeslots: [] }
		this.data = {};
	}

	connect() {
		// Load file & data
		return fs.readFile(this.filename).then(content => {
			const data = JSON.parse(content);
			data.timeslots = data.timeslots?.map(slot => new Timeslot(slot)) || [];
			this.data = data;
		}).catch(e => {
			// DB has not yet been created
			if(e.code === 'ENOENT') {
				this.data = { timeslots: [] };
				return;
			}

			throw e;
		});
	}

	#save() {
		return fs.writeFile(this.filename, JSON.stringify(this.data));
	}

	insert(timeslot) {
		const id = (Math.random() * 0x10000000).toString(16).slice(0, 6);
		timeslot.id = id;
		this.data.timeslots = this.data.timeslots || [];
		this.data.timeslots.push(timeslot);
		return this.#save();
	}

	delete(timeslot_id) {
		this.data.timeslots = this.data.timeslots || [];
		const new_timeslots = this.data.timeslots.filter(t => t.id !== timeslot_id);
		this.data.timeslots = new_timeslots;
		return this.#save();
	}

	update(timeslot) {
		this.data.timeslots = this.data.timeslots || [];
		const foundIndex = this.data.timeslots.findIndex(t => t.id === timeslot.id);
		if(foundIndex === -1) {
			throw new Error(`Cannot update timeslot with id ${timeslot.id} since it does not exist`);
		}

		this.data.timeslots[foundIndex] = timeslot;
		return this.#save();
	}

	get_bound({ from, to, include_overlap = true }) {
		// filter data
		const { timeslots=[] } = this.data;
		const filtered = timeslots.filter(timeslot => {
			if(!include_overlap) {
				return new Date(timeslot.start_date).getTime() >= from && new Date(timeslot.end_date).getTime() <= to;
			}

			return new Date(timeslot.end_date).getTime() >= from && new Date(timeslot.start_date).getTime() <= to;
		});

		return Promise.resolve(filtered);
	}

	get_all() {
		return Promise.resolve(this.data.timeslots || []);
	}
}

module.exports = JSONDB;
