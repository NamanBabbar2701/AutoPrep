🚀 AutoPrep – AI-Powered Data Preprocessing Web App

AutoPrep is an AI-assisted data preprocessing platform where users can simply upload a dataset and receive a cleaned, transformed, ready-to-use CSV file.
It handles missing values, encoding, scaling, outlier removal, date conversions, and more — automatically.

✨ Features
🔹 Automatic Data Cleaning

Detects missing values

Imputes numeric & categorical fields

Removes duplicates

Identifies & removes outliers (IQR method)

Fixes inconsistent date formats

Drops columns with excessive missing data

🔹 Smart Feature Engineering

One-hot & label encoding

Standardization & scaling

Extracts date components (Year/Month/Day)

Handles high-cardinality categorical features

🔹 Seamless User Workflow

Upload → Process → Download

Instant preprocessing summary

Clean CSV output

🔹 Modern UI + Fast Backend

Built with React + Vite + Tailwind

Backend powered by FastAPI

🏗️ Tech Stack
Frontend

React.js

Vite

TailwindCSS

Axios

React Dropzone

Backend

FastAPI

Python 3.10+

Pandas

NumPy

Scikit-learn

Uvicorn

python-multipart

📁 Project Structure
AutoPrep/
│── backend/
│   ├── main.py
│   ├── services/
│   │   ├── preprocess.py
│   │   ├── file_handler.py
│   ├── uploads/
│   ├── processed/
│   ├── models/
│   │   └── schemas.py
│   └── utils/
│       ├── encoders.py
│       ├── scalers.py
│
│── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Upload.jsx
│   │   │   ├── Process.jsx
│   │   │   ├── Download.jsx
│   │   ├── components/
│   │   ├── api/
│   │   │   └── index.js
│   │   └── styles/
│   └── index.html
│
└── README.md

⚡ How It Works

Upload Dataset (CSV/XLSX)

Backend analyzes:

Missing values

Datatypes

Column distribution

AutoPrep preprocesses using rules:

Mean/Median/Mode imputation

Label or One-Hot encoding

Scaling numeric features

Outlier removal

Datetime conversion

Download cleaned dataset

🚀 Running the Project
🔧 Backend Setup (FastAPI)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


Backend runs at:
👉 http://localhost:8000

API Docs:
👉 http://localhost:8000/docs

🎨 Frontend Setup (React + Vite)
cd frontend
npm install
npm run dev


Frontend runs at:
👉 http://localhost:5173

🌐 API Endpoints
POST /upload

Upload dataset → returns summary + column analysis.

POST /process

Runs preprocessing → saves cleaned file.

GET /download/{file_id}

Download final processed CSV.

🧠 Preprocessing Logic
Numeric Columns

Median imputation

StandardScaler

IQR-based outlier removal

Categorical Columns

Mode imputation

Label/One-Hot encoding

Date Columns

Auto datetime parsing

Extract Y/M/D

Text Columns

Fill empty strings

📦 Future Enhancements

AutoML integration

Profiling report (charts)

Correlation heatmaps

Custom preprocessing pipelines

User accounts + history tracking

🤝 Contributing

Contributions are welcome!
Open an issue or submit a pull request for new features or fixes.
