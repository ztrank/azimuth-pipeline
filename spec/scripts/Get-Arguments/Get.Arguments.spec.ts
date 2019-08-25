import 'reflect-metadata';
import { GetArguments } from '../../../src/Get-Arguments/Get.Arguments';
import { Container, injectable, multiInject } from 'inversify';
import { PipelineSymbols } from '../../../src/symbols';

@injectable()
class MultiInject {
    public constructor(@multiInject(PipelineSymbols.Argv) public args: any[]) {}
}

test('Get Arguments', (done) => {
    const argv = ['node', 'something', '-d', '--project-name', 'azimuth-test'];
    const expectedDebug = true;
    const expectedProjectName = 'azimuth-test';
    const getArgs = new GetArguments();
    const container = new Container();

    getArgs.run(
        container, 
        argv, 
        {shortFlag: '-d', longFlag: '--debug', description: 'Debug'},
        {shortFlag: '-n', longFlag: '--project-name <type>', description: 'Name of the Project'},
    ).subscribe(() => {
        expect(container.isBound(PipelineSymbols.Argv)).toBeTruthy();
        const args = container.get<any>(PipelineSymbols.Argv);
        expect(args.debug).toBe(expectedDebug);
        expect(args.projectName).toBe(expectedProjectName);
        container.bind<MultiInject>('Multi').to(MultiInject);
        const multi = container.get<MultiInject>('Multi');
        expect(multi.args).toHaveLength(1);
        done();
    });
});