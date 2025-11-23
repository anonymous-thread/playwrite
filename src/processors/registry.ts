export interface IProcessor {
  run(options: Record<string, any>): Promise<void>;
}

type ProcessorConstructor = new () => IProcessor;

export class ProcessorRegistry {
  private static processors: Map<string, ProcessorConstructor> = new Map();

  static register(name: string, constructor: ProcessorConstructor) {
    this.processors.set(name, constructor);
  }

  static get(name: string): IProcessor | undefined {
    const Constructor = this.processors.get(name);
    return Constructor ? new Constructor() : undefined;
  }
}

export function Processor(name: string) {
  return function (constructor: ProcessorConstructor) {
    ProcessorRegistry.register(name, constructor);
  };
}
