import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';

type Configuration = {
  image: string;
  ports?: {
    container: number;
    host?: number;
    protocol?: 'tcp' | 'udp';
  }[];
  exposes?: {
    [name: string]: any;
  };
}

const getPackageJson = async () => {
  const location = path.join(process.cwd(), 'package.json');
  if (!fsSync.existsSync) {
    return undefined;
  }
  const data = await fs.readFile(location, 'utf-8');
  return JSON.parse(data);
}

const getConfig = async (): Promise<Configuration> => {
  const config: Configuration = {
    image: 'node:16',
  };
  const pkg = await getPackageJson();

  if (pkg?.dangerzone?.image) {
    config.image = pkg.dangerzone.image;
  }

  if (pkg?.dangerzone?.ports) {
    config.ports = pkg.dangerzone.ports.reduce((output: any, current: any) => ({
      ...output,
      [`${current.container}/${current.protocol || 'tcp'}`]: [{
        HostPort: (current.host || current.container).toString(),
      }]
    }), {} as any)

    config.exposes = pkg.dangerzone.ports.reduce((output: any, current: any) => ({
      ...output,
      [`${current.container}/${current.protocol || 'tcp'}`]: {
      }
    }), {} as any)
  }

  return config;
}

export { getConfig };
