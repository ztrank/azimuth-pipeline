import { injectable, multiInject, optional } from 'inversify';
import { Runnable } from '../Pipeline/interfaces/Runnable';
import { Observable, from } from 'rxjs';
import { spawn } from 'child_process';
import { PipelineSymbols } from '../symbols';
import { merge } from '../helpers/Helpers';

@injectable()
export class ExecuteCommand implements Runnable {
    public answers: {[key: string]: any} = {};
    public argv: {[key: string]: any} = {};

    public constructor(
        @multiInject(PipelineSymbols.Argv) @optional() argvs: any[] = [],
        @multiInject(PipelineSymbols.Answers) @optional() answers: any[] = []
    ) {
        this.answers = merge(this.answers, ...answers);
        this.argv = merge(this.argv, ...argvs);
    }

    public run(
        command: string, 
        ...args: string[]
    ): Observable<void> {

        return from(new Promise<void>((resolve, reject) => {
            const child = spawn(command, args);
            child.on('close', (code) => {
                if(code === 0) {
                    resolve();
                } else {
                    reject();
                }
            });
            child.stderr.on('data', (data) => {
                console.error(data);
            });
            child.stdout.on('data', (data) => {
                console.log(data);
            });
        }));
    }
}