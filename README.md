# Identity Reconciliation


### Problem Statement: [Link](https://loud-yumberry-23a.notion.site/Identity-Reconciliation-Backend-API-7ad4441040f84aa9b6437d8f77a6c714)
 
### Solution Approach: [Link](./solution.md)

## Technologies Used

- **Backend:** Node.js, Express, TypeScript  
- **Database:** Neon (Serverless PostgreSQL), Sequelize ORM  
- **Testing:** Mocha, Chai
- **Deployment:** Render

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

### Environment Variables

Create a `.env` file in the root directory and add the following variables:  

```plaintext
PORT = 3000
NODE_ENV = 'production' # 'test', 'development', 'production'

DATABASE_URL_DEV = your_database_url_here 
DATABASE_URL_TEST = your_database_url_here 
DATABASE_URL_PROD = your_database_url_here 
```

### Running the API
To start the API server at port: 3000, run:
```bash
npm run build
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
    "secondaryContactIds": []
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

- ServerHost URL: https://identity-reconciliation-9043.onrender.com (Since I'm using the Render free tier, it takes some time to receive a response to the initial request.)
