/*
 Description:The class  overrides the CREATE behaviour for the default queryProvider class.
 This script provides the scripts used for ORACLE database
 Filename: query.provider.js
 Created Date: 15/10/2013
 */

var queryProvider = function () {

    var dbScriptManager = require('/modules/data/common/db.script.manager.js').dbScriptManagerModule().getInstance();

    var ORACLE_DRIVER = 'oracle';
    var log = new Log('oracle.query.provider');

    /*
     The function builds a CREATE sql statement based on the provided schema
     */
    function create(schema) {
        var query = dbScriptManager.find(ORACLE_DRIVER, schema.table);
        return query;
    }

    function checkIfTableExists(schema){
        var query = "select * from USER_OBJECTS where OBJECT_TYPE = 'TABLE' and OBJECT_NAME = 'resource'";
        return query;
    }

    function insert(schema){
        var query = 'INSERT INTO "resource" (uuid,content,fileName,tenantId,contentType,contentLength) VALUES (?,?,?,?,?,?)';
        return query;
    }
    function select(schema,predicate){
        var query = 'SELECT * FROM "resource" WHERE  uuid=\'' + predicate.uuid + "'";
        return query;
    }

    return{
        create: create,
        insert: insert,
        select: select,
        checkIfTableExists:checkIfTableExists
    }
};


