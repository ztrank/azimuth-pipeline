import 'reflect-metadata';
import { PipelineImpl } from '../../../../src/Pipeline/implementations/Pipeline';
import { of } from 'rxjs';
import { Container, injectable } from 'inversify';
import { IFileUtil } from '../../../../src/Utils/interfaces';
import { PipelineSymbols } from '../../../../src/symbols';
import Path from 'path';

const _root = 'C:\\Github\\post-install-pipeline';
const _projectName = 'azimuth-pipeline';
const _outerRoot = _root + '\\node_modules\\' + _projectName;
const _fileUtil = {
    traverseBackUntil: jest.fn().mockImplementation((dir, indicators) => {
        
        expect(dir).toBeDefined();
        expect(indicators).toBeDefined();
        expect(indicators).toBe('.git');
        if(dir === Path.dirname(_outerRoot)) {
            return of(_root);
        }
        return of(_outerRoot);
    })
}

//run(...args: any[]): Observable<void>;
class Runnable {
    run = jest.fn();
}

const runWatcher = {
    ran: jest.fn()
};

@injectable()
class RunItself {
    run = jest.fn().mockImplementation(() => {
        runWatcher.ran();
        return of(undefined);
    })
}

beforeEach(() => {
    _fileUtil.traverseBackUntil.mockClear();
    runWatcher.ran.mockClear();
});

test('Run', (done) => {
    const container = new Container();

    const pipeline = new PipelineImpl(<IFileUtil><any>_fileUtil, _projectName);
    const item1 = new Runnable();
    item1.run.mockImplementation((...args: any[]) => {
        expect(args).toHaveLength(2);
        expect(args[0]).toBe('first');
        expect(args[1]).toBe('second');
        return of(undefined);
    });


    const item2 = new Runnable();
    item2.run.mockImplementation((...args: any[]) => {
        expect(args).toHaveLength(0);
        return of(undefined);
    });

    const item3 = new Runnable();
    item3.run.mockImplementation((...args: any[]) => {
        expect(args).toHaveLength(4);
        expect(args[0]).toBe(true);
        expect(args[1]).toBe(1);
        expect(args[2]).toBe(2);
        expect(args[3]).toBe(3);
        return of(undefined);
    });

    
    pipeline.register(container, item1, 'first', 'second')
        .register(container, item2)
        .register(container, item3, true, 1, 2, 3)
        .register(container, RunItself)
        .run(container)
        .subscribe({
            next: () => {
                expect(_fileUtil.traverseBackUntil).toHaveBeenCalledTimes(2);
                expect(container.isBound(PipelineSymbols.ProjectRoot));
                expect(item1.run).toHaveBeenCalledTimes(1);
                expect(item2.run).toHaveBeenCalledTimes(1);
                expect(item3.run).toHaveBeenCalledTimes(1);
                expect(runWatcher.ran).toHaveBeenCalledTimes(1);
                done();
            },
            error: err => done(err)
        })

    
})