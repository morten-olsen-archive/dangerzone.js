type Configuration = {
  image?: string;
}

const getConfig = async (): Promise<Configuration> => {
  return {
    image: 'node:16',
  };
}

export { getConfig };
