# Identity Reconciliation

## Problem Statement: 

## Getting Started
### Prerequisites
- Node.js
- npm

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/kodamsai2/Identity-Reconciliation.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Identity-Reconciliation
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

### Running the API
To start the API server at port: 3000, run:
```bash
npm run start
```

## Usage
### API Endpoint
- **POST /api/v1/identify**

##### **Description**  
This endpoint identifies and manages contact records based on the provided email or phone number.  
- If the contact exists, it returns the primary and associated secondary contacts.  
- If the contact does not exist, a new record is created.

##### **Request Body**  
```json
{
  "email": "user@example.com",
  "phoneNumber": 123456
}
```

##### **Response Body**  
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2, 3]
  },
  "success": true
}
```

##### **Status Codes**  
- **`200 OK`** – Successfully identified or created contact.  
- **`400 Bad Request`** – Missing or invalid `email` or `phoneNumber`.  
- **`500 Internal Server Error`** – Unexpected server error.

### Links
- Postman API document URL: https://documenter.getpostman.com/view/28166640/2sAYdeLXDy

- ServerHost URL: https://identity-reconciliation-9043.onrender.com
