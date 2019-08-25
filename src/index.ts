export * from './Set-Json-Defaults/Set.Json.Defaults';
import * as Utils from './Utils';
import { Container } from 'inversify';
import { FileUtil, JsonUtil } from './Utils';
import { IFileUtil, IJsonUtil } from './Utils/interfaces';
import { PipelineSymbols } from './symbols';
import { Pipeline } from './Pipeline/interfaces/Pipeline';
import { PipelineImpl } from './Pipeline/implementations/Pipeline';
export { Utils };

export function Bind(
    container: Container,
    pipeline: new (...args:any[]) => Pipeline = PipelineImpl,
    fileUtil: new (...args:any[]) => IFileUtil = FileUtil,
    jsonUtil: new (...args:any[]) => JsonUtil = JsonUtil
): Pipeline {
    const pipelineSymbol = Symbol.for('Pipeline');
    container.bind<IFileUtil>(PipelineSymbols.FileUtil).to(fileUtil);
    container.bind<IJsonUtil>(PipelineSymbols.JSONUtil).to(jsonUtil);
    container.bind<Pipeline>(pipelineSymbol).to(pipeline);
    return container.get(pipelineSymbol);
}

export { PipelineSymbols }