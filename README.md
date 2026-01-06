# MySQL Query Skill

A Claude agent skill for querying MySQL databases.

## Setup

### 1. Install Dependencies

```bash
cd .claude/skills/mysql/scripts
npm install
```

### 2. Configure Environment

Edit the `.env` file in the `scripts/` directory:


Required variables:
```env
# Database Connection
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASS=your_password
MYSQL_DB=your_database

# Permissions (set to true to enable)
ALLOW_INSERT_OPERATION=false
ALLOW_UPDATE_OPERATION=false
ALLOW_DELETE_OPERATION=false
ALLOW_DDL_OPERATION=false
```

### 3. Test Connection

```bash
node index.js test-connection
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MYSQL_HOST` | MySQL host | `127.0.0.1` |
| `MYSQL_PORT` | MySQL port | `3306` |
| `MYSQL_USER` | MySQL username | `root` |
| `MYSQL_PASS` | MySQL password | (empty) |
| `MYSQL_DB` | Database name | (multi-db mode) |
| `MYSQL_SSL` | Enable SSL | `false` |
| `ALLOW_INSERT_OPERATION` | Allow INSERT | `false` |
| `ALLOW_UPDATE_OPERATION` | Allow UPDATE | `false` |
| `ALLOW_DELETE_OPERATION` | Allow DELETE | `false` |
| `ALLOW_DDL_OPERATION` | Allow DDL | `false` |

## Multi-DB Mode

Leave `MYSQL_DB` empty to enable multi-database mode. Use schema-specific permissions:

```env
SCHEMA_INSERT_PERMISSIONS=db1:true,db2:false
SCHEMA_UPDATE_PERMISSIONS=db1:true,db2:false
```
