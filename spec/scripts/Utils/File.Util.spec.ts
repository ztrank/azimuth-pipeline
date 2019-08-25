import 'reflect-metadata';
import { FileUtil } from '../../../src/Utils/implementations/file.util';
import fs from 'fs';
import Path from 'path';

jest.mock('fs');

beforeEach(() => {
    (<any>fs.readFile).mockReset();
    (<any>fs.writeFile).mockReset();
    (<any>fs.mkdir).mockReset();
    (<any>fs.readdir).mockReset();
});

function mockImpl(fn: any, impl: Function): void {
    (<any>fn).mockImplementation(impl);
}

test('Construct', () => {
    const fu = new FileUtil(); 
    expect(fu).toBeDefined();
});

test('Get File', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const path1 = 'src';
    const path2 = 'app.config.json';

    mockImpl(fs.readFile, (path: string, options: any, callback: any) => {
        expect(path).toBe(Path.join(root, path1, path2));
        expect(options).toBeDefined();
        expect(options.encoding).toBe('utf8');
        callback(null, 'file!');
    });

    const fu = new FileUtil();
    fu.getFile(root, path1, path2)
        .subscribe({
            next: file => {
                expect(file).toBe('file!');
                expect(fs.readFile).toHaveBeenCalledTimes(1);
                done();
            },
            error: err => done(err)
        });
});

test('Get File', (done) => {
    const content = 'content';
    const root = 'C:\\Projects\\nebula-shell';
    const path1 = 'src';
    const path2 = 'app.config.json';

    mockImpl(fs.readdir, (path: string, callback: any) => {
        if(path === root) {
            callback(undefined, ['src']);
        }
    })

    mockImpl(fs.writeFile, (path: string, c: any, callback: any) => {
        expect(path).toBe(Path.join(root, path1, path2));
        expect(c).toBe(content);
        callback(null);
    });

    const fu = new FileUtil();
    fu.saveFile(content, root, path1, path2)
        .subscribe({
            next: () => {
                expect(fs.writeFile).toHaveBeenCalledTimes(1);
                done();
            },
            error: done
        });
});

test('Make Dir: Not Present', (done) => {
    const newDir = 'src';
    const root = 'C:\\Projects\\nebula-shell';
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage'
        ]);
    });

    mockImpl(fs.mkdir, (path: string, callback: any) => {
        expect(path).toBe(Path.join(root, newDir));
        callback();
    });

    const fu = new FileUtil();
    fu.makeDir(root, newDir)
        .subscribe(path => {
            expect(path).toBe(Path.join(root, newDir));
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            expect(fs.mkdir).toHaveBeenCalledTimes(1);
            done();
        });
});

test('Make Dir: Present', (done) => {
    const newDir = 'src';
    const root = 'C:\\Projects\\nebula-shell';
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
            'src'
        ]);
    });

    const fu = new FileUtil();
    fu.makeDir(root, newDir)
        .subscribe(path => {
            expect(path).toBe(Path.join(root, newDir));
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            expect(fs.mkdir).toHaveBeenCalledTimes(0);
            done();
        });
});

test('Contains File', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const searchingFor = '.git';
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            '.git',
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
            'src'
        ]);
    });

    const fu = new FileUtil();
    fu.containsFile(root, searchingFor)
        .subscribe(contains => {
            expect(contains).toBeTruthy();
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        });
});


test('Does not Contain File', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const searchingFor = '.git';
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
            'src'
        ]);
    });

    const fu = new FileUtil();
    fu.containsFile(root, searchingFor)
        .subscribe(contains => {
            expect(contains).toBeFalsy();
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        });
});


test('Contains Files', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const searchingFor = ['.git', 'src'];
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            '.git',
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
            'src'
        ]);
    });

    const fu = new FileUtil();
    fu.containsFile(root, searchingFor)
        .subscribe(contains => {
            expect(contains).toBeTruthy();
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        });
});

test('Contains some Files', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const searchingFor = ['.git', 'src'];
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
            'src'
        ]);
    });

    const fu = new FileUtil();
    fu.containsFile(root, searchingFor)
        .subscribe(contains => {
            expect(contains).toBeTruthy();
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        });
});

test('Contains some Files: All or nothing', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const searchingFor = ['.git', 'src'];
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
            'src'
        ]);
    });

    const fu = new FileUtil();
    fu.containsFile(root, searchingFor, true)
        .subscribe(contains => {
            expect(contains).toBeFalsy();
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        });
});

test('Contains none of the Files', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const searchingFor = ['.git', 'src'];
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
        ]);
    });

    const fu = new FileUtil();
    fu.containsFile(root, searchingFor, true)
        .subscribe(contains => {
            expect(contains).toBeFalsy();
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        });
});

test('Contains none of the Files: Not all or nothing', (done) => {
    const root = 'C:\\Projects\\nebula-shell';
    const searchingFor = ['.git', 'src'];
    mockImpl(fs.readdir, (path: string, callback: any) => {
        expect(path).toBe(root);
        callback(null, [
            'package.json',
            'tslint.json',
            'spec',
            'node_modules',
            'coverage',
        ]);
    });

    const fu = new FileUtil();
    fu.containsFile(root, searchingFor)
        .subscribe(contains => {
            expect(contains).toBeFalsy();
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        });
});

test('Tranverse until', (done) => {
    const startAt = 'C:\\Projects\\nebula-shell\\node_modules\\@trankzachary\\nebula-shell\\bin\\init';
    const expected = 'C:\\Projects\\nebula-shell';

    mockImpl(fs.readdir, (path: string, callback: any) => {
        let values: string[] = [];
        if(path.endsWith('init')) {
            values = [
                'init.js',
                'symbols.d.ts',
                'init.d.ts',
                'symbols.js',
                'utils'
            ];
        } else if(path.endsWith('bin')) {
            values = [
                'init'
            ];
        } else if(path.endsWith('@trankzachary\\nebula-shell')) {
            values = [
                'bin',
                'index.d.ts',
                'index.js',
                'authentication',
                'configuration',
                'http'
            ];
        } else if(path.endsWith('@trankzachary')) {
            values = [
                'nebula-shell'
            ];
        } else if(path.endsWith('node_modules')) {
            values = [
                '@trankzachary',
                '@google-cloud',
                '@babel',
                '.bin',
                '@jest'
            ];
        } else if(path.endsWith('Projects\\nebula-shell')) {
            values = [
                '.git',
                'package.json',
                'package-lock.json',
                '.gitignore'
            ];
        } else if(path.endsWith('Projects')) {
            values = [
                'nebula-shell'
            ];
        } else {
            values = ['Projects'];
        }

        callback(null, values);
    });

    const fu = new FileUtil();
    fu.traverseBackUntil(startAt, '.git')
        .subscribe(path => {
            expect(path).toBe(expected);
            expect(fs.readdir).toHaveBeenCalledTimes(6);
            done();
        });
});


test('Tranverse until', (done) => {
    const startAt = 'C:\\Projects\\nebula-shell\\node_modules\\@trankzachary\\nebula-shell\\bin\\init';
    const expected = 'C:\\Projects\\nebula-shell';

    mockImpl(fs.readdir, (path: string, callback: any) => {
        let values: string[] = [];
        if(path.endsWith('init')) {
            values = [
                'init.js',
                'symbols.d.ts',
                'init.d.ts',
                'symbols.js',
                'utils'
            ];
        } else if(path.endsWith('bin')) {
            values = [
                'init'
            ];
        } else if(path.endsWith('@trankzachary\\nebula-shell')) {
            values = [
                'bin',
                'index.d.ts',
                'index.js',
                'authentication',
                'configuration',
                'http'
            ];
        } else if(path.endsWith('@trankzachary')) {
            values = [
                'nebula-shell'
            ];
        } else if(path.endsWith('node_modules')) {
            values = [
                '@trankzachary',
                '@google-cloud',
                '@babel',
                '.bin',
                '@jest'
            ];
        } else if(path.endsWith('Projects\\nebula-shell')) {
            values = [
                '.git',
                'package.json',
                'package-lock.json',
                '.gitignore'
            ];
        } else if(path.endsWith('Projects')) {
            values = [
                'nebula-shell'
            ];
        } else {
            values = ['Projects'];
        }

        callback(null, values);
    });

    const fu = new FileUtil();
    fu.traverseBackUntil(startAt, ['.git', 'package.json', 'unknown.ts'])
        .subscribe(path => {
            expect(path).toBe(expected);
            expect(fs.readdir).toHaveBeenCalledTimes(6);
            done();
        });
});

test('Tranverse until', (done) => {
    const startAt = 'C:\\Projects\\nebula-shell\\node_modules\\@trankzachary\\nebula-shell\\bin\\init';

    mockImpl(fs.readdir, (path: string, callback: any) => {
        let values: string[] = [];
        if(path.endsWith('init')) {
            values = [
                'init.js',
                'symbols.d.ts',
                'init.d.ts',
                'symbols.js',
                'utils'
            ];
        } else if(path.endsWith('bin')) {
            values = [
                'init'
            ];
        } else if(path.endsWith('@trankzachary\\nebula-shell')) {
            values = [
                'bin',
                'index.d.ts',
                'index.js',
                'authentication',
                'configuration',
                'http'
            ];
        } else if(path.endsWith('@trankzachary')) {
            values = [
                'nebula-shell'
            ];
        } else if(path.endsWith('node_modules')) {
            values = [
                '@trankzachary',
                '@google-cloud',
                '@babel',
                '.bin',
                '@jest'
            ];
        } else if(path.endsWith('Projects\\nebula-shell')) {
            values = [
                '.git',
                'package.json',
                'package-lock.json',
                '.gitignore'
            ];
        } else if(path.endsWith('Projects')) {
            values = [
                'nebula-shell'
            ];
        } else {
            values = ['Projects'];
        }

        callback(null, values);
    });

    const fu = new FileUtil();
    fu.traverseBackUntil(startAt, ['.git', 'package.json', 'unknown.ts'], true)
        .subscribe(path => {
            done('Whoops');
        }, err => {
            done();
        });
});

test('Save saveFile', (done) => {
    const root = 'root';
    const filename = 'Test.txt';
    const content = 'content';
    const existing = {
        root : ['src'],
        src: [],
        test: []
    };
    const unsafePath = ['src', 'test', 'Test.txt'];

    (<jest.Mock><any>fs.writeFile).mockImplementation((path, contents, callback) => {
        console.log(path);
        expect(path.endsWith(filename)).toBeTruthy();
        expect(contents).toBe(content);
        callback();
    });
    (<jest.Mock><any>fs.readdir).mockImplementation((path: any, callback: any) => {
        if(path.endsWith('root')) {
            callback(undefined, existing.root);
        } else if(path.endsWith('src')) {
            callback(undefined, existing.src);
        } else if(path.endsWith('test')) {
            callback(undefined, existing.test);
        }
    });
    (<jest.Mock><any>fs.mkdir).mockImplementation((path: any, callback: any) => {
        callback();
    });

    const fileUitl = new FileUtil();
    fileUitl.saveFile(content, root, ...unsafePath)
        .subscribe(() => {
            expect(fs.writeFile).toBeCalled();
            expect(fs.readdir).toBeCalled();
            expect(fs.mkdir).toBeCalled();
            done();

        });
})