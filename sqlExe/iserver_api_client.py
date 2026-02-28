import requests
import base64
import time
import uuid
import json
import argparse
import pyarrow as pa
import pyarrow.ipc as ipc

# Fixed DuckDB DBRID for pushdown operations
PUSHDOWN_DBRID = "7369CD70211A4DFBB82173AF3049781C"


class IServerClient:
    def __init__(self, iserver_host, port):
        self.base_url = f"http://{iserver_host}:{port}/api"
        self.session_id = None
        self.project_id = None
        
    def create_session(self, login="administrator", password=""):
        """Step 1: Create iServer session"""
        url = f"{self.base_url}/sessions"
        payload = {
            "login": login,
            "password": password
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        self.session_id = data.get("sessionId")
        print(f"✓ Authenticated. Session ID: {self.session_id}")
        return self.session_id
    
    def set_project_id(self, project_id):
        """Set the project ID for subsequent requests"""
        self.project_id = project_id
        
    def encode_sqls(self, sqls):
        """Encode SQL statements to base64"""
        encoded = []
        for sql in sqls:
            # Equivalent to JavaScript: btoa(unescape(encodeURIComponent(s)))
            encoded_sql = base64.b64encode(sql.encode('utf-8')).decode('ascii')
            encoded.append(encoded_sql)
        return encoded
    
    def execute_sql(self, sqls, dbrid, table_id=None):
        """Step 2/4: Execute SQL on source table or pushdown table"""
        url = f"{self.base_url}/openSemanticLayer/sqlexecution"
        if table_id:
            print(f"→ execute SQL and push down the result to table: {table_id}")
            url += f"?tableId={table_id}"
        
        headers = {
            "X-MSTR-ISERVER-SESSION": self.session_id,
            "X-MSTR-ISERVER-PROJECT-ID": self.project_id,
            "Content-Type": "application/json"
        }
        
        encoded_sqls = self.encode_sqls(sqls)
        payload = {
            "sqls": encoded_sqls,
            "dbrid": dbrid
        }
        
        print(f"\n→ Executing SQL:")
        for i, sql in enumerate(sqls, 1):
            print(f"  {i}. {sql}")
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        # Extract task ID from href link
        href = data.get("link", {}).get("href", "")
        task_id = href.split('/')[-1]
        
        print(f"✓ SQL execution submitted. Task ID: {task_id}")
        return task_id
    
    def poll_result(self, task_id, poll_interval=1, max_attempts=60):
        """Step 3/5: Poll for task completion"""
        url = f"{self.base_url}/queues/{task_id}"
        
        headers = {
            "X-MSTR-ISERVER-SESSION": self.session_id,
            "X-MSTR-ISERVER-PROJECT-ID": self.project_id
        }
        
        status_names = {
            0: "INITIATED",
            1: "RUNNING",
            2: "PARTIALLY_READY",
            3: "EXEC_READY",
            4: "EXEC_ERROR",
            5: "EXEC_EXPIRED",
            6: "EXEC_CANCELED"
        }
        
        for attempt in range(max_attempts):
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            status = data.get("status", 0)
            status_name = status_names.get(status, f"UNKNOWN({status})")
            
            print(f"⏳ Polling... Status: {status} ({status_name})")
            
            # Status 0, 1, 2: Continue polling
            if status in [0, 1, 2]:
                time.sleep(poll_interval)
                continue
            
            # Status 3: EXEC_READY - Parse arrow result
            if status == 3:
                print("✓ Task completed successfully (EXEC_READY)!")
                results_data = data.get("results", {}).get("data", "")
                return results_data
            
            # Status 4, 5, 6: EXEC_ERROR, EXEC_EXPIRED, EXEC_CANCELED - Print all result
            if status in [4, 5, 6]:
                print(f"⚠ Task ended with status: {status_name}")
                print(f"Full response: {json.dumps(data, indent=2)}")
                return None
        
        raise TimeoutError(f"Task {task_id} did not complete within {max_attempts} attempts")
    
    def decode_and_parse_arrow(self, encoded_data):
        """Decode base64 and decompress lz4 to get arrow binary data"""
        # Base64 decode
        data = base64.b64decode(encoded_data)
        
        # Try LZ4 decompression, if it fails, assume data is uncompressed
        buf = pa.py_buffer(data)
        reader = ipc.RecordBatchStreamReader(buf)
        
        table = reader.read_all()
        
        return table
    
    def print_arrow_table(self, table):
        """Print arrow table data row by row"""
        print(f"\n{'='*80}")
        print(f"Table Schema:")
        print(table.schema)
        print(f"\nRows: {table.num_rows}, Columns: {table.num_columns}")
        print(f"{'='*80}")
        
        # Print column names
        print(" | ".join(table.column_names))
        print("-" * 80)
        
        # Print rows
        for i in range(table.num_rows):
            row = [str(table.column(col_idx)[i].as_py()) for col_idx in range(table.num_columns)]
            print(" | ".join(row))
        
        print(f"{'='*80}\n")
    
    def run_pushdown_workflow(self, uid, pwd, project_id, source_dbrid, sqls, pushdown_table_id):
        """Execute workflow: Run source SQLs, push down to DuckDB table, and query for validation"""
        print("="*80)
        print("ISERVER API CLIENT - PUSHDOWN WORKFLOW")
        print("="*80)
        
        # Step 1: Create session
        print("\n[STEP 1] Creating iServer session...")
        self.create_session(uid, pwd)
        self.set_project_id(project_id)
        
        # Step 2: Execute SQL on source table
        print("\n[STEP 2] Executing SQL on source table...")
        task_id = self.execute_sql(sqls, source_dbrid, pushdown_table_id)
        
        # Step 3: Poll for results
        print("\n[STEP 3] Polling for results...")
        encoded_data = self.poll_result(task_id)
        
        if encoded_data:
            print("\n[STEP 3] Decoding and parsing results...")
            table = self.decode_and_parse_arrow(encoded_data)
            self.print_arrow_table(table)
        
        # Step 4: Execute SQL on pushdown table
        print("\n[STEP 4] Executing SQL on pushdown table...")
        pushdown_sqls = [f"SELECT * FROM \"{pushdown_table_id}\";"]
        task_id_2 = self.execute_sql(pushdown_sqls, PUSHDOWN_DBRID)
        
        # Step 5: Poll and print results
        print("\n[STEP 5] Polling for pushdown results...")
        encoded_data_2 = self.poll_result(task_id_2)
        
        if encoded_data_2:
            print("\n[STEP 5] Decoding and parsing pushdown results...")
            table_2 = self.decode_and_parse_arrow(encoded_data_2)
            self.print_arrow_table(table_2)
        
        print("\n✓ Pushdown workflow completed successfully!")
    
    def run_sql_workflow(self, uid, pwd, project_id, dbrid, sqls):
        """Execute workflow: Run SQLs with provided DBRID and parse arrow results"""
        print("="*80)
        print("ISERVER API CLIENT - SQL EXECUTION WORKFLOW")
        print("="*80)
        
        # Step 1: Create session
        print("\n[STEP 1] Creating iServer session...")
        self.create_session(uid, pwd)
        self.set_project_id(project_id)
        
        # Step 2: Execute SQL
        print("\n[STEP 2] Executing SQL...")
        task_id = self.execute_sql(sqls, dbrid)
        
        # Step 3: Poll for results
        print("\n[STEP 3] Polling for results...")
        encoded_data = self.poll_result(task_id)
        
        if encoded_data:
            print("\n[STEP 3] Decoding and parsing results...")
            table = self.decode_and_parse_arrow(encoded_data)
            self.print_arrow_table(table)
        else:
            print("\n⚠ No data returned or task failed.")
        
        print("\n✓ SQL execution workflow completed successfully!")


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="IServer API Client - Execute SQL workflows")
    parser.add_argument(
        "workflow",
        type=str,
        nargs="?",
        default="pushdown",
        choices=["pushdown", "sql"],
        help="Workflow type: 'pushdown' (default) or 'sql'"
    )
    args = parser.parse_args()
    
    # Configuration
    ISERVER_HOST = "10.23.38.83"  # Change to your iServer host
    PORT = "34962"  # iserver rest api port
    PROJECT_ID = "E59A38AB4C9B8DDEB5E445B3837534F3"  # Set your project ID
    UID = "administrator"  # iServer login user ID
    PWD = ""  # iServer login password (if required)
    
    # Create client
    client = IServerClient(ISERVER_HOST, PORT)
    
    # Use workflow type from command-line argument
    WORKFLOW_TYPE = args.workflow
    
    try:
        if WORKFLOW_TYPE == "pushdown":
            SOURCE_DBRID = "59D46BD9412714BE7B10778416D080F8"  # SQL for the source DBRole
            PUSHDOWN_TABLE_ID = uuid.uuid4().hex.upper()  # Randomly generated pushdown table ID
            # Run pushdown workflow: Execute SQLs, push to DuckDB, and validate
            sqls = [
                "DROP TABLE IF EXISTS users;",
                "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50), email VARCHAR(100));",
                "INSERT INTO users (id, name, email) VALUES (1, 'Alice', 'alice@example.com');",
                "INSERT INTO users (id, name, email) VALUES (2, 'Bob', 'bob@example.com');",
                "INSERT INTO users (id, name, email) VALUES (3, 'Charlie', 'charlie@example.com');",
                "SELECT * FROM users;"
            ]

            client.run_pushdown_workflow(
                uid=UID,
                pwd=PWD,
                project_id=PROJECT_ID,
                source_dbrid=SOURCE_DBRID,
                sqls=sqls,
                pushdown_table_id=PUSHDOWN_TABLE_ID
            )
        elif WORKFLOW_TYPE == "sql":
            # Run simple SQL workflow: Execute SQLs and parse results
            SOURCE_DBRID = "59D46BD9412714BE7B10778416D080F8"  # SQL for the source DBRole
            sqls = [
                "DROP TABLE IF EXISTS users;",
                "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50), email VARCHAR(100));",
                "INSERT INTO users (id, name, email) VALUES (1, 'Alice', 'alice@example.com');",
                "SELECT * FROM users;"
            ]
            # or SOURCE_DBRID = PUSHDOWN_DBRID  # SQL for the pushdown DBRole
            # tune SQLs accordingly if using pushdown DBRID, e.g. referencing the correct table name

            client.run_sql_workflow(
                uid=UID,
                pwd=PWD,
                project_id=PROJECT_ID,
                dbrid=SOURCE_DBRID,
                sqls=sqls
            )
        else:
            print(f"\n❌ Unknown workflow type: {WORKFLOW_TYPE}")
            print("Usage: py iserver_api_client.py [pushdown|sql]")
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        raise


if __name__ == "__main__":
    main()
