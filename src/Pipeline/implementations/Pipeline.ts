import { injectable, inject, Container } from 'inversify';
import { Observable, of } from 'rxjs';
import { PipelineSymbols } from '../../symbols';
import { IFileUtil } from '../../Utils/interfaces';
import { tap, mergeMap } from 'rxjs/operators';
import { Pipeline } from '../interfaces/Pipeline';
import { PipelineItem } from '../interfaces/Pipeline.Item';
import { Runnable, RunnableConstructor } from '../interfaces/Runnable';

@injectable()
export class PipelineImpl implements Pipeline {

    public items: PipelineItem[] = [];

    public constructor(
        @inject(PipelineSymbols.FileUtil) private fileUtil: IFileUtil
    ) {}

    register(container: Container, runnable: Runnable | RunnableConstructor, ...args: any[]): Pipeline {
        const itemSymbol = Symbol.for('itemIndex' + this.items.length);
        this.items.push({
            item: itemSymbol,
            args: args
        });
        
        if(typeof runnable === 'function') {
            container.bind<Runnable>(itemSymbol).to(runnable);
        } else {
            container.bind<Runnable>(itemSymbol).toConstantValue(runnable);
        }
        return this;
    }

    run(container: Container): Observable<void> {
        return this.fileUtil.traverseBackUntil(__dirname, '.git')
            .pipe(
                tap(root => container.bind<string>(PipelineSymbols.ProjectRoot).toConstantValue(root)),
                mergeMap(() => this.runItems(container))
            );
    }

    private runItems(container: Container): Observable<void> {
        return this.runIndex(0, container);
    }

    private runIndex(index: number, container: Container): Observable<void> {
        if(this.items.length <= index) {
            return of(undefined);
        } else {
            return this.runItem(this.items[index], container)
                .pipe(
                    mergeMap(() => this.runIndex(index + 1, container))
                );
        }
    }

    private runItem(item: PipelineItem, container:Container): Observable<void> {
        const pipelineItem = <Runnable>container.get(item.item);
        return pipelineItem.run(...item.args);
    }
}