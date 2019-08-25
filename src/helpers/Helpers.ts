export function merge(...objs: any[]): any {
    return objs.reduce((newObj: any, obj: any) => {
        obj = obj || {};
        return {
            ...newObj,
            ...obj
        }
    }, {});
}