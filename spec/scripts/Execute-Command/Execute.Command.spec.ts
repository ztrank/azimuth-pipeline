import 'reflect-metadata';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { ExecuteCommand } from '../../../src/Execute-Command/Execute.Command';

let stdOut = new EventEmitter();
let stdErr = new EventEmitter();
let on = new EventEmitter();

const child = {
    stdout: {
        on: jest.fn().mockImplementation((name, callback) => {
            expect(name).toBe('data');
            stdOut.on('data', callback);
        })
    },
    stderr: {
        on: jest.fn().mockImplementation((name, callback) => {
            expect(name).toBe('data');
            stdErr.on('data', callback);
        })
    },
    on: jest.fn().mockImplementation((name, callback) => {
        expect(name).toBe('close');
        on.on('close', callback);
    })
};

jest.mock('child_process', () => ({
    ...jest.requireActual('child_process'),
    spawn: jest.fn().mockImplementation(() => child)
}));

beforeEach(() => {
    stdOut = new EventEmitter();
    stdErr = new EventEmitter();
    on = new EventEmitter();
    child.on.mockClear();
    child.stderr.on.mockClear();
    child.stdout.on.mockClear();
    (<jest.Mock>spawn).mockClear();
});

test('Spawn Success', (done) => {
    const executer = new ExecuteCommand();
    executer.run('cd', '..')
        .subscribe(() => {
            expect(spawn).toHaveBeenCalled();
            expect(child.stdout.on).toHaveBeenCalled();
            expect(child.stderr.on).toHaveBeenCalled();
            expect(child.on).toHaveBeenCalled();
            done();
        });
    stdOut.emit('data', 'Running...');
    on.emit('close', 0);
});

test('Spawn Error', (done) => {
    const executer = new ExecuteCommand();
    executer.run('cd', '..')
        .subscribe({
            next: () => done('whoops'),
            error: () => {
                expect(spawn).toHaveBeenCalled();
                expect(child.stdout.on).toHaveBeenCalled();
                expect(child.stderr.on).toHaveBeenCalled();
                expect(child.on).toHaveBeenCalled();
                done();
            }
        });
    stdErr.emit('data', 'Whoops!');
    on.emit('close', 1);
});