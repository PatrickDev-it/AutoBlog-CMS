export {};

const patterns = [
	'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
	'AIza[0-9A-Za-z_-]{30,}',
	'gh[pousr]_[0-9A-Za-z]{30,}',
	'sk-[0-9A-Za-z]{24,}',
	'mongodb(\\+srv)?://[^[:space:]<>]+',
].join('|');

const child = Bun.spawn(['git', 'grep', '-nI', '-E', '-e', patterns, '--', ':!bun.lock'], {
	stdout: 'pipe',
	stderr: 'pipe',
});
const output = await new Response(child.stdout).text();
const errorOutput = await new Response(child.stderr).text();
const exitCode = await child.exited;

if (exitCode === 0) {
	const locations = output.trim().split(/\r?\n/u).map((line) => {
		const match = /^([^:]+):(\d+):/u.exec(line);
		return match ? `${match[1]}:${match[2]}` : 'tracked file (location withheld)';
	});
	console.error(`Potential secret material found at:\n${locations.join('\n')}`);
	globalThis.process.exitCode = 1;
}

if (exitCode !== 1) {
	console.error(errorOutput.trim() || 'Secret scan could not inspect tracked files.');
	globalThis.process.exitCode = exitCode;
}

if (exitCode === 1) console.log('Current-tree secret scan passed.');
