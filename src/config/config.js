const fs = require('fs/promises');
const os = require('os');
const path = require('path')

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
		});
	}

	#apply_config(config) {
		this.config = {
			...DEFAULT_CONFIG,
			...config
		};

		return this;
	}

	read(filename=null) {
		if(!filename) {
			return this;
		}

		const file_path = path.join(process.cwd(), filename);

		return fs.stat(file_path).then(() => {
			const config_provider = require(file_path);
			const config = config_provider();
			return this.#apply_config(config);
		}).catch(e => {
			if(e.code === 'ENOENT') {
				return this.#apply_config(config);
			}

			throw e;
		})

	}
}

const config = new Config();

module.exports = config;
