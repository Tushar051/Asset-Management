# Admin Asset Manager

Enterprise asset management system built with SAPUI5.

## Features
- Dashboard with KPI tiles
- Asset request management
- Bulk approve/reject functionality
- Real-time notifications
- Search functionality
- Admin profile management

## Running in SAP BAS

### Prerequisites
- SAP Business Application Studio access
- Node.js installed

### Setup
1. Clone the repository
2. Navigate to project folder:
   ```bash
   cd admin_asset_manager
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Run Application
```bash
npm start
```

The application will open automatically in the browser at `http://localhost:8080`

## Running Locally (without BAS)

### Using Python
```bash
cd admin_asset_manager/webapp
python -m http.server 8080
```

### Using Node http-server
```bash
npm install -g http-server
cd admin_asset_manager/webapp
http-server -p 8080
```

## Project Structure
```
admin_asset_manager/
├── webapp/
│   ├── controller/
│   │   ├── App.controller.js
│   │   ├── BaseController.js
│   │   └── Dashboard.controller.js
│   ├── view/
│   │   ├── App.view.xml
│   │   ├── Dashboard.view.xml
│   │   └── fragments/
│   ├── model/
│   │   └── models.js
│   ├── utils/
│   │   ├── NotificationManager.js
│   │   └── SearchHelper.js
│   ├── css/
│   │   └── style.css
│   ├── Component.js
│   ├── manifest.json
│   └── index.html
├── ui5.yaml
└── package.json
```

## Technology Stack
- SAPUI5 / OpenUI5
- JavaScript
- XML Views
- JSON Model

## Author
Tushar
