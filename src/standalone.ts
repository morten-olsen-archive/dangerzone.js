import { program } from 'commander';
import { run } from './run';

const node = program.command('node');
node.allowUnknownOption();
node.action(() => {
  const args = process.argv.splice(3);
  run('node', args);
});

const yarn = program.command('yarn');
yarn.allowUnknownOption();
yarn.action(() => {
  const args = process.argv.splice(3);
  run('yarn', args);
});

const npm = program.command('npm');
npm.allowUnknownOption();
npm.action(() => {
  const args = process.argv.splice(3);
  run('npm', args);
});

const cmd = program.command('cmd');
cmd.allowUnknownOption();
cmd.action(() => {
  const [command, ...args] = process.argv.splice(3);
  run(command, args);
});

program.parse(process.argv);
