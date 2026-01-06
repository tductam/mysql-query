#!/usr/bin/env node
/**
 * MySQL Query CLI Script for Claude Agent Skill
 * Usage:
 *   node index.js query "SELECT * FROM users"
 *   node index.js list-tables
 *   node index.js describe <table_name>
 *   node index.js test-connection
 */

import { log } from "./src/utils/index.js";
import {
    SKILL_VERSION,
    isMultiDbMode,
    ALLOW_INSERT_OPERATION,
    ALLOW_UPDATE_OPERATION,
    ALLOW_DELETE_OPERATION,
    ALLOW_DDL_OPERATION,
    dbConfig as config,
} from "./src/config/index.js";
import {
    getPool,
    executeReadOnlyQuery,
    executeQuery,
} from "./src/db/index.js";

// Output JSON response
function outputJSON(success, data, error = null, executionTime = null) {
    const response = { success };
    if (data !== null) response.data = data;
    if (error !== null) response.error = error;
    if (executionTime !== null) response.executionTime = executionTime;
    console.log(JSON.stringify(response, null, 2));
}

// Test database connection
async function testConnection() {
    try {
        const pool = await getPool();
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT 1 as connected");
        connection.release();

        outputJSON(true, {
            connected: true,
            version: SKILL_VERSION,
            host: config.mysql.host || config.mysql.socketPath,
            database: config.mysql.database || "Multi-DB Mode",
            multiDbMode: isMultiDbMode,
            permissions: {
                insert: ALLOW_INSERT_OPERATION,
                update: ALLOW_UPDATE_OPERATION,
                delete: ALLOW_DELETE_OPERATION,
                ddl: ALLOW_DDL_OPERATION,
            }
        });
    } catch (error) {
        outputJSON(false, null, `Connection failed: ${error.message}`);
        process.exit(1);
    }
}

// List all tables
async function listTables() {
    try {
        const sql = `
            SELECT 
                table_schema as 'database',
                table_name as name,
                table_rows as rowCount,
                ROUND(data_length / 1024 / 1024, 2) as dataSizeMB,
                table_comment as description
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
            ORDER BY table_schema, table_name
        `;
        const result = await executeReadOnlyQuery(sql);
        const data = JSON.parse(result.content[0].text);
        outputJSON(true, data, null, result.content[1]?.text);
    } catch (error) {
        outputJSON(false, null, `Failed to list tables: ${error.message}`);
        process.exit(1);
    }
}

// Describe table structure
async function describeTable(tableName) {
    if (!tableName) {
        outputJSON(false, null, "Table name is required");
        process.exit(1);
    }

    try {
        const sql = `
            SELECT 
                column_name as name,
                data_type as type,
                column_type as fullType,
                is_nullable as nullable,
                column_key as 'key',
                column_default as 'default',
                extra,
                column_comment as comment
            FROM information_schema.columns 
            WHERE table_name = ?
            ORDER BY ordinal_position
        `;
        const rows = await executeQuery(sql, [tableName]);
        outputJSON(true, rows);
    } catch (error) {
        outputJSON(false, null, `Failed to describe table: ${error.message}`);
        process.exit(1);
    }
}

// Execute SQL query
async function runQuery(sql) {
    if (!sql) {
        outputJSON(false, null, "SQL query is required");
        process.exit(1);
    }

    try {
        const result = await executeReadOnlyQuery(sql);
        const data = JSON.parse(result.content[0].text);
        const executionTime = result.content[1]?.text;
        outputJSON(!result.isError, data, result.isError ? data : null, executionTime);
        if (result.isError) process.exit(1);
    } catch (error) {
        outputJSON(false, null, `Query failed: ${error.message}`);
        process.exit(1);
    }
}

// Show help
function showHelp() {
    const help = {
        skill: "mysql-query",
        version: SKILL_VERSION,
        commands: {
            "query <sql>": "Execute a SQL query",
            "list-tables": "List all tables in the database",
            "describe <table>": "Show table structure",
            "test-connection": "Test database connection"
        },
        examples: [
            'node index.js query "SELECT * FROM users LIMIT 5"',
            'node index.js list-tables',
            'node index.js describe users',
            'node index.js test-connection'
        ]
    };
    console.log(JSON.stringify(help, null, 2));
}

// Main
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === "help" || command === "--help" || command === "-h") {
        showHelp();
        return;
    }

    switch (command) {
        case "test-connection":
            await testConnection();
            break;
        case "list-tables":
            await listTables();
            break;
        case "describe":
            await describeTable(args[1]);
            break;
        case "query":
            await runQuery(args.slice(1).join(" "));
            break;
        default:
            outputJSON(false, null, `Unknown command: ${command}. Use 'help' for available commands.`);
            process.exit(1);
    }

    // Close pool after command completes
    try {
        const pool = await getPool();
        await pool.end();
    } catch (e) {
        // Ignore pool closing errors
    }
}

main().catch(error => {
    outputJSON(false, null, `Unexpected error: ${error.message}`);
    process.exit(1);
});
