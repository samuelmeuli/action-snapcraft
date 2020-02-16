const { execSync } = require("child_process");
const { writeFileSync } = require("fs");

const LOGIN_FILE_PATH = "./snap-token.txt";

/**
 * Logs to the console
 */
const log = msg => console.log(`\n${msg}`); // eslint-disable-line no-console

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 */
const run = cmd => execSync(cmd, { encoding: "utf8", stdio: "inherit" });

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
	run("sudo snap install snapcraft --classic");
	run("sudo chown root:root /"); // Fix root ownership
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
	if (platform === "linux") {
		runLinuxInstaller();
	} else if (platform === "mac") {
		runMacInstaller();
	} else {
		log("Snapcraft is not yet available for Windows. Skipping");
		process.exit(0);
	}

	// Log in
	if (process.env.INPUT_SNAPCRAFT_TOKEN) {
		log("Logging in to Snapcraft…");
		writeFileSync(LOGIN_FILE_PATH, process.env.INPUT_SNAPCRAFT_TOKEN);
		run(`snapcraft login --with ${LOGIN_FILE_PATH}`);
		run(`rm ${LOGIN_FILE_PATH}`);
	} else {
		log(`No "snapcraft_token" input variable provided. Skipping login`);
	}
};

runAction();
