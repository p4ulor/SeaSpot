export class Param {
    /**
     * @param {string} name 
     * @param {boolean} isNumber 
     */
    constructor(name, isNumber){
        this.name = name
        this.isNumber = isNumber
    }
}

/**
* @param {Express.Request} req 
* @param {Array<Param>} arrayOfParams accepts array in case we want to join the 2 boolean conditions together
* @param {Boolean} isPathParams 
* @param {Boolean} isMandatory if true, and if the field is null or undefined, throws BadRequest
* @returns {Array<String | Number | undefined>}
*/
export function doesPathContain_Query_or_Path_Params(req, arrayOfParams, isPathParams, isMandatory){
    const paramValues = []
    arrayOfParams.forEach(param => {
        const paramValue = (isPathParams) ? req.params[param.name] : req.query[param.name]
        if(!isPathParams && paramValue==undefined) {
            //if query param is missing, do nothing. But since we do [varname1, varname2] we need to fill it or it doesnt match
            if(isMandatory) throw new codes.BadRequest(`Query param :${req.query[param.name]} is missing`)
            paramValues.push(undefined)
        } else {
            if(paramValue==undefined) throw new codes.BadRequest(`Path param :${param.name} is missing`)
            if(param.isNumber && isNaN(Number(paramValue))) throw new codes.BadRequest(`Path param :${param.name} should be of type number, received '${typeof paramValue}' -> '${paramValue}'`)
            else paramValues.push(paramValue)
        }
    })
    return paramValues
}