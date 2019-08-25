import { Observable, from, of } from 'rxjs';
import { promisify } from 'util';
import fs from 'fs';
import Path from 'path';
import { mergeMap, map } from 'rxjs/operators';
import { IFileUtil } from '../interfaces/IFile.Util';
import { injectable } from 'inversify';

@injectable()
export class FileUtil implements IFileUtil {

    private doSaveFile(content: string, pathIndex: number, ...paths: string[]): Observable<void> {
        if(pathIndex + 1 === paths.length - 1) {
            const path = Path.join(...paths);
            return from(promisify(fs.writeFile)(content, path));
        } else {
            return this.containsFile(paths[pathIndex], paths[pathIndex + 1])
                .pipe(
                    mergeMap(contains => {
                        if(contains) {
                            return this.doSaveFile(content, pathIndex + 1, ...paths);
                        } else {
                            return this.makeDir(paths[pathIndex], paths[pathIndex + 1])
                                .pipe(
                                    mergeMap(() => this.doSaveFile(content, pathIndex + 1, ...paths))
                                )
                        }
                    })
                )
        }
    }

    public getFile(root: string, ...paths: string[]): Observable<string> {
        const path = Path.join(root, ...paths);
        return from(promisify(fs.readFile)(path, {encoding: 'utf8'}));
    }

    public saveFile(content: string, root: string, ...paths: string[]): Observable<void> {
        /*const path = Path.join(root, ...paths);
        return from(promisify(fs.writeFile)(path, content));*/
        return this.doSaveFile(content, 0, root, ...paths);
    }

    public makeDir(parent: string, dirName: string): Observable<string> {
        const path = Path.join(parent, dirName);
        return this.containsFile(parent, dirName)
            .pipe(
                mergeMap(containsFile => {
                    if(containsFile) {
                        return of(path);
                    } else {
                        return from(promisify(fs.mkdir)(path))
                            .pipe(map(() => path));
                    }
                })
            );
    }

    public containsFile(directory: string, fileName: string | string[], allOrNone: boolean = false): Observable<boolean> {
        return from(promisify(fs.readdir)(directory))
            .pipe(
                map(files => {
                    if(Array.isArray(fileName)) {
                        return fileName.reduce((containsFile: boolean, expectedFile: string) => {
                            const hasThisFile = files.indexOf(expectedFile) > -1;
                            return allOrNone ? containsFile && hasThisFile : hasThisFile || containsFile;
                        }, allOrNone);
                    } else {
                        return files.indexOf(fileName) > -1;
                    }
                })
            );
    }

    public traverseBackUntil(directory: string,  indicators: string | string[], allOrNone: boolean = false): Observable<string> {
        return this.doTraverseBackUntil(directory, indicators, allOrNone);
    }

    private doTraverseBackUntil(directory: string, indicators: string | string[], allOrNone: boolean): Observable<string> {
        return this.containsFile(directory, indicators, allOrNone)
            .pipe(
                mergeMap(containsFile => {
                    if(containsFile) {
                        return of(directory);
                    } else {
                        const parent = Path.dirname(directory);
                        if(parent === directory) {
                            throw new Error('Unable to locate the directory');
                        }
                        return this.traverseBackUntil(parent, indicators, allOrNone);
                    }
                })
            );
    }
} 