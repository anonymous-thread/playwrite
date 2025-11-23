import { Command } from 'commander';
import minimist from 'minimist';
import { ProcessorRegistry } from './processors';

const program = new Command();

program
  .version('1.0.0')
  .description('Web scraper CLI')
  .requiredOption('-p, --processor <type>', 'Processor to use (e.g., googlemap)')
  .allowUnknownOption()
  .argument('[args...]') // Capture all other arguments
  .action(async (args, options) => {
    // If options is undefined, it might be because of argument shifting. 
    // Commander passes (args, options, command) or (options, command) depending on arguments.
    // Let's rely on parsing process.argv manually for dynamic args to be safe.
    
    // Actually, when .argument is used, the first param is the argument.
    // But we want to support flags like --query="...".
    // .allowUnknownOption() lets them pass, but they might not be in 'options' if not defined.
    
    // Let's simplify: just use commander for processor, and minimist for everything else.
    // We need to access the processor option.
    
    const opts = program.opts();
    const processor = opts.processor;
    
    // Parse all arguments using minimist to get dynamic flags
    
    const parsedArgs = minimist(process.argv.slice(2));
    
    
    // Remove known args handled by commander (if any overlap, though here we just want the rest)
    // Actually, minimist parses everything. We can just pass the whole args object 
    // or filter out 'processor' and aliases.
    // The processor might expect specific keys like 'query'.
    
    const processorInstance = ProcessorRegistry.get(processor);
    
    if (!processorInstance) {
      console.error(`Error: Processor "${processor}" not found.`);
      console.error('Available processors:', 'googlemap');
      process.exit(1);
    }

    await processorInstance.run(parsedArgs);
  });

program.parse(process.argv);
