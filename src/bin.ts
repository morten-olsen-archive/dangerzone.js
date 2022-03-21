import { run } from './run';

module.exports = (command: string) => {
  const args = process.argv.splice(2);
  run(command, args);
};
