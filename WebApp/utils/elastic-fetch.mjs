import fetch from "node-fetch"
import { ServerConfiguration } from "../server.mjs"
import http from 'node:http';

/** Provides auxiliary functions to access the elastic Search DB
 * @param {ServerConfiguration} config 
*/
function elasticFetch(config){

    const ELASTIC_SEARCH_URL = config.elasticSearchURL

    async function doesIndexExist(indexName){
        const uri = doesIndexExistUri(indexName)
        return await fetch(uri, {method: "HEAD"}).then(response =>
            response.ok
        )
    }
    
    async function createIndex(indexName){
        const uri = createIndexUri(indexName)
        easyFetch(uri, "PUT")
    }
    
    async function getDoc(index, id){
        const uri = getDocUri(index, id)
        return easyFetch(uri)
    }
    
    /**
     * @param {string} index Unique index identifier
     * @param {string} field the name of the field
     * @param {Object} value
     */
    async function searchDoc(index, field, value){
        const uri = searchDocWithValUri(index, field, value)
        return easyFetch(uri)
    }

    /**
     * @param {string} index Unique index identifier
     * @param {Int} skip
     * @param {Int} limit
     */
    async function searchDocPaged(index, skip, limit){
        const uri = searchDocPagedUri(index, skip, limit)
        return easyFetch(uri)
    }

    /**
     * @param {string} index Unique index identifier
     * @param {string} field the name of the field
     * @param {Object} value
     * @param {Int} skip
     * @param {Int} limit
     */
    async function searchWithValDocPaged(index, field, value, skip, limit){
        const uri = searchDocWithValPagedUri(index, field, value, skip, limit)
        return easyFetch(uri)
    }

    /**
     * @param {string} index Unique index identifier
     * @param {Array<string>} fields the name of the fields
     * @param {Array<Object>} values the values of the fields
     * @param {Int} skip
     * @param {Int} limit
     */
    async function searchDocWithValuesPaged(index, fields, values, skip, limit){
        if(fields.length!=values.length) throw new Error("Invalid usage of searchDocWithValuesPaged")
        const query = makeQuery(fields, values)

        const bodyQuery = makeQueryObjWithPaging(skip, limit, query)

        const uri = searchDocPlainUri(index)
        return easyFetch(uri, "GET", bodyQuery)
    }
    
    /**
     * @param {string} index Unique index identifier
     * @param {string} id the identifier of the entity
     * @param {Object} body an objected with a corresponding ObjStructure for that index
     */
    async function updateDoc(index, id, body) {
        const uri = updateDocUri(index, id)
        return easyFetch(uri, "POST", updateBody(body))
    }
    
    async function createDoc(index, body) {
        const uri = createDocUri(index)
        return easyFetch(uri, "POST", body)
    }
    
    async function createDocWithID(index, body, id) {
        const uri = createDocWithIDUri(index, id)
        return easyFetch(uri, "POST", body)
    }
    
    async function deleteDoc(index, id){
        const uri = deleteDocUri(index, id)
        return easyFetch(uri, "DELETE")
    }

    async function deleteByQuery(index, fields, values){
        if(fields.length!=values.length) throw new Error("Invalid usage of deleteByQuery")
        const query = makeQuery(fields, values)

        const uri = deleteDocsUri(index)
        return easyFetch(uri, "POST", {query: query})
    }
    
    /**
     * @param {string} uri 
     * @param {string} method must be like "POST", "GET" etc
     * @param {Object} body 
     * @returns {Promise<any>}
     */
    async function easyFetch(uri, method, body = undefined) {
        const options = {}
        if (body) {
            options.headers = {
                'Content-Type': 'application/json'
            }
            options.body= JSON.stringify(body)
        }
        options.method = method //if undefined/null, a GET will be done
        options.agent = new http.Agent({ keepAlive: true }); //needed when indexes are created for some reason, [1] [2]
    
        return fetch(uri, options).then(response => 
            response.json()
        )
    }
    
    const doesIndexExistUri = (index) => `${ELASTIC_SEARCH_URL}/${index}`
    const searchDocPlainUri = (index) => `${ELASTIC_SEARCH_URL}/${index}/_search`
    const searchDocPagedUri = (index, skip, limit) => `${ELASTIC_SEARCH_URL}/${index}/_search?from=${skip}&size=${limit}`  
    const searchDocWithValUri = (index, field, value) => `${ELASTIC_SEARCH_URL}/${index}/_search?q=${field}:${value}` 
    const searchDocWithValPagedUri = (index, field, value, skip, limit) => `${ELASTIC_SEARCH_URL}/${index}/_search?q=${field}:${value}&from=${skip}&size=${limit}` 
    const getDocUri = (index, id) => `${ELASTIC_SEARCH_URL}/${index}/_doc/${id}`
    const createDocUri = (index) => `${ELASTIC_SEARCH_URL}/${index}/_doc/?refresh=wait_for`
    const createDocWithIDUri = (index, id) => `${ELASTIC_SEARCH_URL}/${index}/_doc/${id}?refresh=true`
    const createIndexUri = (index) => `${ELASTIC_SEARCH_URL}/${index}?refresh=true`
    const updateDocUri = (index, id) => `${ELASTIC_SEARCH_URL}/${index}/_update/${id}?refresh=wait_for`
    const deleteDocUri = (index, id) => `${ELASTIC_SEARCH_URL}/${index}/_doc/${id}?refresh=wait_for`
    const deleteDocsUri = (index) => `${ELASTIC_SEARCH_URL}/${index}/_delete_by_query` // [3]
    
    const updateBody = (body) => { return {doc: body}} // [4]

    function makeQueryObjWithPaging(skip, limit, query){
        return {
            "from" : skip,
            "size" : limit,
            "query" : query
        }
    }

    //Utils
    /**
     * Aids in making a valid body to delete doc's with fields equal to the values indicaded [3]
     * @param {Array<string>} fields the name of the fields
     * @param {Array<Object>} values the values of the fields
     * @returns {{match: { }}}
     */
    function makeQuery(fields, values){
        const match = {}

        fields.forEach((field, index) => {
            match[field] = values[index]
        })
        return match
    }

    return {
        doesIndexExist,
        createIndex,
        getDoc,
        searchDoc,
        searchDocPaged,
        searchWithValDocPaged,
        searchDocWithValuesPaged,
        updateDoc,
        createDoc,
        createDocWithID,
        deleteDoc,
        deleteByQuery
    }

}

export default elasticFetch

/**
 * @param {Object} obj search result obj returned by elasticsearch
 * @returns {Array<{id: string, obj: object}>}
 */
export function searchObjToObjArray(obj){
    const arr = []
    obj.hits.hits.forEach(result => {
        arr.push(
            {
                id: result._id,
                obj: result._source
            }
        )
    })
    return arr
}

/** References
 * [1] https://github.com/node-fetch/node-fetch/issues/1735 
 * [2] https://stackoverflow.com/q/16995184
 * [3] https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-delete-by-query.html
 * [4] https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update.html#_update_part_of_a_document
 */