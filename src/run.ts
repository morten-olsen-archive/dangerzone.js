import Docker from 'dockerode';

const createInstance = (container: Docker.Container) => new Promise<void>(async (resolve, reject) => {
  container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    if (err) {
      return reject(err);
    }
    container.modem.demuxStream(stream, process.stdout, process.stderr);
    stream!.on('end', () => {
      resolve();
    })
  });
  await container.start();
});

const runAction = async (command: string, args: string[]) => {
  const docker = new Docker();
  const container = await docker.createContainer({
    Image: 'node:16',
    Tty: false,
    WorkingDir: '/app',
    Entrypoint: [],
    Cmd: [
      command,
      ...args,
    ],
    HostConfig: {
      Binds: [
        `${process.cwd()}:/app`
      ]
    }
  });
  try {
    await createInstance(container);
  } finally {
    await container.remove();
  }
};

export const run = (command: string, args: string[]) => {
  runAction(command, args).catch((err) => {
    console.error(err);
    process.exit(-1);
  });
};
