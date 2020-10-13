const { execSync } = require("child_process");
const { writeFileSync, unlinkSync } = require("fs");

const LOGIN_FILE_PATH = "./snap-token.txt";

/**
 * Logs to the console
 */
const log = (msg) => console.log(`\n${msg}`); // eslint-disable-line no-console

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 */
const run = (cmd, printStdio = true) =>
	execSync(cmd, { encoding: "utf8", stdio: printStdio ? "inherit" : "pipe" });

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
	const useLxd = process.env.INPUT_USE_LXD === "true";
	run("sudo snap install snapcraft --classic");
	if (useLxd) {
		run("sudo snap install lxd");
		run(`sudo usermod --append --groups lxd ${process.env.USER}`);
	}
	run(`echo /snap/bin >> ${process.env.GITHUB_PATH}`); // Add `/snap/bin` to PATH for subsequent actions
	run("sudo chown root:root /"); // Fix root ownership
	if (useLxd) {
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
	if (platform === "windows") {
		log("Snapcraft is not yet available for Windows. Skipping");
		process.exit(0);
	} else if (process.env.INPUT_SKIP_INSTALL === "true") {
		log("Skipping install");
	} else if (platform === "linux") {
		log("Installing Snapcraft for Linux…");
		runLinuxInstaller();
	} else if (platform === "mac") {
		log("Installing Snapcraft for macOS…");
		runMacInstaller();
	} else {
		log("Unknown platform");
		process.exit(1);
	}

	const snapcraftPath =
		platform === "linux" ? "/snap/bin/snapcraft" : run("which snapcraft", false).trim();
	log(`Snapcraft is installed at ${snapcraftPath}`);

	// Log in
	if (process.env.INPUT_SNAPCRAFT_TOKEN) {
		log("Logging in to Snapcraft…");
		writeFileSync(LOGIN_FILE_PATH, process.env.INPUT_SNAPCRAFT_TOKEN);
		run(`${snapcraftPath} login --with ${LOGIN_FILE_PATH}`);
		unlinkSync(LOGIN_FILE_PATH);
	} else {
		log(`No "snapcraft_token" input variable provided. Skipping login`);
	}
};

runAction();
