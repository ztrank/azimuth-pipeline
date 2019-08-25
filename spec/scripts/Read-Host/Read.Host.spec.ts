import 'reflect-metadata';
import { createPromptModule } from 'inquirer';
import { Container } from 'inversify';
import { ReadHost } from '../../../src/Read-Host/Read.Host';

const _prompt = jest.fn();

jest.mock('inquirer', () => ({
    ...jest.requireActual('inquirer'),
    createPromptModule: jest.fn().mockImplementation(() => _prompt)
}));

beforeEach(() => {
    _prompt.mockReset();
    (<jest.Mock>createPromptModule).mockClear();
});

test('Ask and Answer', (done) => {
    const questions = [
        {
            type: 'input',
            name: 'projectName'
        },
        {
            type: 'confirm',
            name: 'correctDirectory'
        }
    ];

    _prompt.mockImplementation(quests => {
        expect(quests).toHaveLength(2);
        return Promise.resolve({
            projectName: 'pipeline',
            correctDirectory: true
        });
    });

    const container = new Container();
    const readHost = new ReadHost();
    readHost.run(container, ...questions)
        .subscribe(() => {
            expect(container.isBound('projectName')).toBeTruthy();
            expect(container.get('projectName')).toBe('pipeline');
            expect(container.isBound('correctDirectory')).toBeTruthy();
            expect(container.get('correctDirectory')).toBe(true);
            done();
        })
})
