const { execSync } = require("child_process");
const { writeFileSync, unlinkSync } = require("fs");

const LOGIN_FILE_PATH = "./snap-token.txt";

/**
 * Logs to the console
 */
const log = msg => console.log(`\n${msg}`); // eslint-disable-line no-console
const verbose = process.env.INPUT_VERBOSE ? log : () => { };

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 */
const run = cmd => {
	verbose(`$ ${cmd}`);
	verbose(execSync(cmd, { encoding: "utf8", stdio: "inherit" }));
}

/**
 * Determines the current operating system (one of ["mac", "windows", "linux"])
 */
const getPlatform = () => {
	switch (process.platform) {
		case "darwin":
			return "mac";
		case "win32":
			return "windows";
		default:
			return "linux";
	}
};

/**
 * Installs Snapcraft on Linux
 */
const runLinuxInstaller = () => {
	const lxd = process.env.INPUT_USE_LXD === "true";
	run("sudo snap install snapcraft --classic");
	if (lxd) {
		run("sudo snap install lxd");
	}
	run("sudo chown root:root /"); // Fix root ownership
	if (lxd) {
		run("sudo /snap/bin/lxd.migrate -yes");
		run("sudo /snap/bin/lxd waitready");
		run("sudo /snap/bin/lxd init --auto");
	}
};

/**
 * Installs Snapcraft on macOS
 */
const runMacInstaller = () => {
	run("brew install snapcraft");
};

/**
 * Installs Snapcraft and logs the user in
 */
const runAction = () => {
	const platform = getPlatform();

	// Install Snapcraft
	log(`Installing Snapcraft for ${platform.charAt(0).toUpperCase() + platform.slice(1)}…`);
	if (platform === "windows") {
		log("Snapcraft is not yet available for Windows. Skipping");
		process.exit(0);
	} else if (process.env.INPUT_SKIP_INSTALL === "true") {
		log("Skipping install");
	} else if (platform === "linux") {
		runLinuxInstaller();
	} else if (platform === "mac") {
		runMacInstaller();
	} else {
		log("Unknown platform");
		process.exit(1);
	}

	// Log in
	if (process.env.INPUT_SNAPCRAFT_TOKEN) {
		log("Logging in to Snapcraft…");
		writeFileSync(LOGIN_FILE_PATH, process.env.INPUT_SNAPCRAFT_TOKEN);
		run(`snapcraft login --with ${LOGIN_FILE_PATH}`);
		unlinkSync(LOGIN_FILE_PATH);
	} else {
		log(`No "snapcraft_token" input variable provided. Skipping login`);
	}
};

runAction();
