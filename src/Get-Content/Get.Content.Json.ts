import { injectable, inject, Container } from 'inversify';
import { Runnable } from '../Pipeline/interfaces/Runnable';
import { PipelineSymbols } from '../symbols';
import { IJsonUtil } from '../Utils/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@injectable()
export class GetContentJson implements Runnable {
    public constructor(
        @inject(PipelineSymbols.JSONUtil) private jsonUtil: IJsonUtil
    ) {}

    public run(container: Container, identifier: string | symbol, root: string, ...path: string[]): Observable<void> {
        return this.jsonUtil.getJson(root, ...path)
            .pipe(
                map(json => {container.bind(identifier).toConstantValue(json)})
            );
    }
}