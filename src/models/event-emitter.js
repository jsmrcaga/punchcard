class EventEmitter {
	#events = {};
	// Event methods
	on(event, cb) {
		this.#events[event] = this.#events[event] || [];
		this.#events[event].push(cb);
	}

	emit(event, data) {
		const cbs = this.#events[event] || [];
		for(const cb of cbs) {
			cb(data);
		}
	}

	apply_listeners(event_listeners={}) {
		for(const [event_name, callbacks] of Object.entries(event_listeners)) {
			for(const cb of callbacks) {
				this.on(event_name, cb);
			}
		}
	}
}

module.exports = EventEmitter;
