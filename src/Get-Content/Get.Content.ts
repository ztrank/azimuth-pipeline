import { injectable, inject, Container } from 'inversify';
import { Runnable } from '../Pipeline/interfaces/Runnable';
import { PipelineSymbols } from '../symbols';
import { IFileUtil } from '../Utils/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@injectable()
export class GetContent implements Runnable {
    public constructor(
        @inject(PipelineSymbols.FileUtil) private fileUtil: IFileUtil
    ) {}

    public run(container: Container, identifier: string | symbol, root: string, ...path: string[]): Observable<void> {
        return this.fileUtil.getFile(root, ...path)
            .pipe(
                map(file => {container.bind(identifier).toConstantValue(file)})
            );
    }
}