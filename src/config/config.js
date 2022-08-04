const os = require('os');
const fs = require('fs/promises');

const DEFAULT_CONFIG = {
	db_filename: './json',
	db_config: {
		filename: `${os.homedir()}/.punchard.data.json`
	}
};

class Config {
	constructor(config={}) {
		this.#apply_config(config);

		return new Proxy(this, {
			get: (obj, prop) => {
				if(obj[prop]) {
					if(obj[prop] instanceof Function) {
						return obj[prop].bind(obj);
					}

					return obj[prop];
				}

				return obj.config[prop];
			}
		})
	}

	#apply_config(config) {
		this.config = {
			...DEFAULT_CONFIG,
			...config
		};
	}

	read(filename=null) {
		if(!filename) {
			return this;
		}

		const config_provider = require(filename);
		const config = config_provider();

		this.#apply_config(config);
	}
}

const config = new Config();

module.exports = config;
