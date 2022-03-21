import Docker from 'dockerode';
import { getConfig } from './config';

const createInstance = (
  container: Docker.Container,
) => new Promise<void>(async (resolve, reject) => {
  container.attach({
    stream: true,
    stdin: true,
    stdout: true,
    stderr: true 
  }, (err, stream) => {
    if (err) {
      return reject(err);
    }
    stream!.pipe(process.stdout);
    process.stdin.pipe(stream!);
    stream!.on('end', () => {
      process.stdout.unpipe(stream!);
      stream!.unpipe(process.stdout);
      resolve();
    })
  });

  async function exitHandler(options: any, exitCode?: number) {
    await container.stop();
    if (options.exit) process.exit(exitCode);
  }

  process.on('exit', exitHandler.bind(null,{cleanup:true}));
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
  await container.start();
});

const runAction = async (command: string, args: string[]) => {
  const config = await getConfig();
  const docker = new Docker();
  const container = await docker.createContainer({
    Image: config.image,
    Tty: true,
    WorkingDir: '/app',
    OpenStdin: true,
    Cmd: [
      command,
      ...args,
    ],
    ExposedPorts: config.exposes,
    HostConfig: {
      AutoRemove: true,
      //NetworkMode: 'host',
      PortBindings: config.ports,
      Binds: [
        `${process.cwd()}:/app`
      ]
    }
  });
  try {
    await createInstance(container);
  } finally {
    process.exit(0);
  }
};

export const run = (command: string, args: string[]) => {
  runAction(command, args).catch((err) => {
    console.error(err);
    process.exit(-1);
  });
};
