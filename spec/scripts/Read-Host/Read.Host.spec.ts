import 'reflect-metadata';
import { createPromptModule } from 'inquirer';
import { Container, injectable, multiInject } from 'inversify';
import { ReadHost } from '../../../src/Read-Host/Read.Host';
import { PipelineSymbols } from '../../../src/symbols';
import { mergeMap } from 'rxjs/operators';
import { merge } from '../../../src/helpers/Helpers';

const _prompt = jest.fn();

jest.mock('inquirer', () => ({
    ...jest.requireActual('inquirer'),
    createPromptModule: jest.fn().mockImplementation(() => _prompt)
}));

beforeEach(() => {
    _prompt.mockReset();
    (<jest.Mock>createPromptModule).mockClear();
});

@injectable()
class MultiInject {
    public answers: any;
    public constructor(@multiInject(PipelineSymbols.Answers) answers: any[]) {
        this.answers = merge(...answers);
    }
}


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
        .pipe(mergeMap(() => readHost.run(container, ...questions)))
        .subscribe(() => {
            expect(container.isBound(PipelineSymbols.Answers)).toBeTruthy();
            container.bind('Multi').to(MultiInject);
            const multi = container.get<MultiInject>('Multi');
            expect(multi.answers).toBeDefined();
            expect(multi.answers.projectName).toBe('pipeline');
            expect(multi.answers.correctDirectory).toBe(true);
            done();
        });
})
