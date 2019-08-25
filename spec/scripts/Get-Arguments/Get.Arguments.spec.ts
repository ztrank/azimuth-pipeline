import 'reflect-metadata';
import { GetArguments } from '../../../src/Get-Arguments/Get.Arguments';
import { Container } from 'inversify';

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
        expect(container.isBound('debug')).toBeTruthy();
        expect(container.isBound('projectName')).toBeTruthy();
        expect(container.get('debug')).toBe(expectedDebug);
        expect(container.get('projectName')).toBe(expectedProjectName);
        done();
    });
});