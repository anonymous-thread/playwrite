import fs from 'fs';
import * as path from 'path';

export class TemplateService {
  private templatePath: string;

  constructor(templatePath: string) {
    this.templatePath = templatePath;
  }

  render(replacements: Record<string, string>): string {
    const absolutePath = path.isAbsolute(this.templatePath) 
      ? this.templatePath 
      : path.join(process.cwd(), this.templatePath);
      
    let template = fs.readFileSync(absolutePath, 'utf-8');
    
    for (const key in replacements) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, replacements[key] || '');
    }
    
    return template;
  }
}

export default TemplateService;
