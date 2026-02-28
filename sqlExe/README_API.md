# IServer API Client

Python client for interacting with iServer API to execute SQL queries and retrieve results.

## Quick Start - How to Run

### Step 1: Install Dependencies

```bash
cd c:\workspace\projects\countdown\sqlExe
py -m pip install -r requirements.txt
```

### Step 2: Configure Settings

Open `iserver_api_client.py` and update the configuration in the `main()` function:

```python
ISERVER_HOST = "10.23.38.83"      # Your iServer hostname/IP
PORT = "34962"                     # Your iServer port
PROJECT_ID = "E59A38AB..."         # Your project GUID
UID = "administrator"              # Your login username
PWD = ""                           # Your password (empty if not required)
SOURCE_DBRID = "59D46BD9..."       # Your database role ID
```

### Step 3: Run the Script

```bash
py iserver_api_client.py
```

