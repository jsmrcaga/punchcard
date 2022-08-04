class DatabseInterface {
	connect() {
		throw new Error(`Method connect should be overriden`);
	}

	insert() {
		throw new Error(`Method insert should be overriden`);
	}

	delete() {
		throw new Error(`Method delete should be overriden`);
	}

	update() {
		throw new Error(`Method update should be overriden`);
	}

	get_bounded(from, to) {
		throw new Error(`Method get_bounded should be overriden`);
	}

	get_all() {
		throw new Error(`Method get_all should be overriden`);
	}
}

module.exports = { DatabseInterface };
