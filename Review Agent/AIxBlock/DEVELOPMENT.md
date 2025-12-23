## Development Setup Guide

### 1. (Optional) Install PostgreSQL
PostgreSQL is optional. If you already have a database or prefer another, you can skip this step.

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

#### macOS (Homebrew):
```bash
brew update
brew install postgresql
```

#### Windows:
1. Download the installer from [PostgreSQL official site](https://www.postgresql.org/download/).
2. Follow the installation wizard and ensure `pgAdmin` and `psql` are installed.
3. Add PostgreSQL to the system PATH if necessary.

### 2. (Optional) Start and Enable PostgreSQL
If you installed PostgreSQL, start it with the following commands:

#### Ubuntu/Debian:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS:
```bash
brew services start postgresql
```

#### Windows:
- PostgreSQL should start automatically after installation.
- If not, use `pgAdmin` or `Services` to start it manually.

### 3. (Optional) Verify PostgreSQL Installation
```bash
psql --version
```

### 4. (Optional) Set Up Database
If using PostgreSQL, set up the database with the following:
```bash
sudo -u postgres psql
# Inside psql shell
CREATE DATABASE platform_v2;
CREATE USER postgres WITH ENCRYPTED PASSWORD '@9^xwWA';
GRANT ALL PRIVILEGES ON DATABASE platform_v2 TO postgres;
\q
```

### 5. Install Dependencies
Before running the project, install the required dependencies.

#### Using `pip` and `venv` (Recommended)
1. **Create a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate     # On Windows
   ```
2. **Install dependencies from `requirements.txt`**:
   ```bash
   pip install -r requirements.txt
   ```

<!-- #### Using `pipenv` (Alternative)
If you prefer `pipenv`, install dependencies with:
```bash
pip install pipenv
pipenv install --dev
``` -->

### 6. Setup and Run Project
PostgreSQL is not required if your project supports other databases (e.g., SQLite, MySQL). Adjust configurations accordingly.

```bash
# Setup project
make setup

# Run the project - open two terminals
make worker  # In one terminal
make run     # In another terminal
```

