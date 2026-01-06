---
name: mysql-query
description: Executes SQL queries against MySQL database. Use when user needs to query, explore schemas, list tables MySQL databases.
---

# MySQL Query Skill

This skill allows you to interact with MySQL databases via command-line scripts.

## Available Commands

Run commands from the absolute path directory:

# Test database connection
node <SKILL_BASE_DIR>/scripts/index.js test-connection

# List all tables
node <SKILL_BASE_DIR>/scripts/index.js list-tables

# Get table structure
node <SKILL_BASE_DIR>/scripts/index.js describe <table_name>

# Execute SQL query
node <SKILL_BASE_DIR>/scripts/index.js query "<sql>"
```

## Output Format

All commands return JSON with this structure:

```json
{
  "success": true,
  "data": [...],
  "executionTime": "12.34 ms"
}
```

On error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Usage Examples

### Query data
```bash
node <SKILL_BASE_DIR>/scripts/index.js query "SELECT * FROM users LIMIT 10"
```

### Check permissions
```bash
node <SKILL_BASE_DIR>/scripts/index.js test-connection
```
Returns current permissions (insert, update, delete, ddl).

### Explore schema
```bash
node <SKILL_BASE_DIR>/scripts/index.js list-tables
node <SKILL_BASE_DIR>/scripts/index.js describe users
```

## Permissions

Database operations are controlled by `.env` configuration:
- `ALLOW_INSERT_OPERATION` - Enable INSERT
- `ALLOW_UPDATE_OPERATION` - Enable UPDATE  
- `ALLOW_DELETE_OPERATION` - Enable DELETE
- `ALLOW_DDL_OPERATION` - Enable CREATE/ALTER/DROP

Check `test-connection` output to see current permissions.
