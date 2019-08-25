import { injectable, Container } from 'inversify';
import { Runnable } from '../Pipeline/interfaces/Runnable';
import { Observable, from } from 'rxjs';
import inquirer from 'inquirer';

interface Choice {
    name: string;
    value: string|number;
    short: string;
}

interface Question {
    type: string;
    name: string;
    message?: string | Function;
    default?: string|number|boolean|Array<any>|Function;
    choices?: Array<string|number|Choice>|Function;
    validate?: Function;
    filter?: Function;
    transformer?: Function;
    when?: Function;
    pageSize?: number;
    prefix?: string;
    sufix?: string;
}

@injectable()
export class ReadHost implements Runnable {

    public constructor() {}

    public run(container: Container, ...questions: Question[]): Observable<void> {
        const prompt = inquirer.createPromptModule();
        return from(
            prompt(questions)
            .then((answers: inquirer.Answers) => {
                questions.forEach(question => {
                    container.bind<boolean|number|string>(question.name).toConstantValue(answers[question.name]);
                })
            })
        )
    }
}