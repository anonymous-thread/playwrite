import { Command } from 'commander';
import minimist from 'minimist';
import { ProcessorRegistry } from './processors';

const program = new Command();

program
  .version('1.0.0')
  .description('Web scraper CLI')
  .requiredOption('-p, --processor <type>', 'Processor to use (e.g., googlemap)')
  .allowUnknownOption()
  .argument('[args...]')
  .action(async (args, options) => {
    const opts = program.opts();
    const processor = opts.processor;
    
    const parsedArgs = minimist(process.argv.slice(2));
    
    const processorInstance = ProcessorRegistry.get(processor);
    
    if (!processorInstance) {
      console.error(`Error: Processor "${processor}" not found.`);
      console.error('Available processors:', 'googlemap');
      process.exit(1);
    }

    await processorInstance.run(parsedArgs);
  });

program.parse(process.argv);
