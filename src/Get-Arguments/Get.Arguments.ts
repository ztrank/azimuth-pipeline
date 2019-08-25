import commander from 'commander';
import { injectable, Container } from 'inversify';
import { Runnable } from '../Pipeline/interfaces/Runnable';
import { Observable, of } from 'rxjs';
import { PipelineSymbols } from '../symbols';

interface ArgumentOption {
    shortFlag: string;
    longFlag: string;
    description?: string;
    defaultValue?: any
};

function upperCaseFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function lowerCaseFirst(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
function toCamelCase(str: string): string {
    return lowerCaseFirst(str.replace(/\s.+$/, '').split(/[-_]/).map(s => upperCaseFirst(s)).join(''));
}

@injectable()
export class GetArguments implements Runnable {
    public constructor() {}

    public run(container: Container, argv: string[], ...options: ArgumentOption[]): Observable<void> {
        options.forEach(option => {
            commander.option(
                `-${option.shortFlag.replace(/^-+/, '')}, --${option.longFlag.replace(/^-+/, '')}`,
                option.description,
                option.defaultValue
            );
            
        });
        commander.parse(argv);
        const args: {[key:string]: any} = {};

        options.forEach(option => {
            args[toCamelCase(option.longFlag.replace(/^-+/, ''))] = commander[toCamelCase(option.longFlag.replace(/^-+/, ''))];
        });
        container.bind(PipelineSymbols.Argv).toConstantValue(args);
        return of(undefined);
    }
}