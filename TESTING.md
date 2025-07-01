# 🧪 API Testing Guide

## Server Status
✅ Server is running on http://localhost:3000

## 📋 Testing Payloads & Examples

### 1. Health Check
```bash
curl -X GET http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-07T...",
  "version": "v1"
}
```

---

### 2. Authentication Tests

#### 🔐 Login (Use seeded admin user)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "createdAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**📝 Copy the token from the response for next requests!**

#### 👤 Register New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "USER"
  }'
```

#### 👤 Get User Profile
Replace `YOUR_TOKEN_HERE` with actual token:
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 3. Vendor Management Tests

#### 🏢 Create Vendor
```bash
curl -X POST http://localhost:3000/api/v1/vendors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Solutions Ltd",
    "email": "contact@acme.com",
    "phone": "+1-555-0199",
    "address": "456 Business Ave, New York, NY 10001",
    "contactName": "Alice Johnson",
    "status": "ACTIVE"
  }'
```

**Expected Response:**
```json
{
  "message": "Vendor created successfully",
  "data": {
    "id": "clz1234567890",
    "name": "Acme Solutions Ltd",
    "email": "contact@acme.com",
    "phone": "+1-555-0199",
    "address": "456 Business Ave, New York, NY 10001",
    "contactName": "Alice Johnson",
    "status": "ACTIVE",
    "createdAt": "2025-01-07T...",
    "updatedAt": "2025-01-07T..."
  }
}
```

#### 📋 Get All Vendors (with pagination)
```bash
curl -X GET "http://localhost:3000/api/v1/vendors?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 📋 Get All Vendors (with search)
```bash
curl -X GET "http://localhost:3000/api/v1/vendors?search=tech&status=ACTIVE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 🔍 Get Vendor by ID
Replace `VENDOR_ID` with actual ID from create response:
```bash
curl -X GET http://localhost:3000/api/v1/vendors/VENDOR_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### ✏️ Update Vendor
```bash
curl -X PUT http://localhost:3000/api/v1/vendors/VENDOR_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Solutions Updated",
    "phone": "+1-555-0200",
    "status": "ACTIVE"
  }'
```

#### 🗑️ Delete Vendor (only if no payments)
```bash
curl -X DELETE http://localhost:3000/api/v1/vendors/VENDOR_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. Payment Management Tests

#### 💳 Create Payment
Replace `VENDOR_ID` with actual vendor ID:
```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1250.75,
    "description": "Monthly service fee for Q1 2025",
    "vendorId": "VENDOR_ID",
    "dueDate": "2025-02-15T00:00:00Z",
    "status": "PENDING"
  }'
```

**Expected Response:**
```json
{
  "message": "Payment created successfully",
  "data": {
    "id": "clz0987654321",
    "amount": 1250.75,
    "description": "Monthly service fee for Q1 2025",
    "status": "PENDING",
    "paymentDate": null,
    "dueDate": "2025-02-15T00:00:00.000Z",
    "vendorId": "VENDOR_ID",
    "createdAt": "2025-01-07T...",
    "updatedAt": "2025-01-07T...",
    "vendor": {
      "id": "VENDOR_ID",
      "name": "Acme Solutions Ltd",
      "email": "contact@acme.com"
    }
  }
}
```

#### 📋 Get All Payments
```bash
curl -X GET "http://localhost:3000/api/v1/payments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 📋 Get Payments with Filters
```bash
curl -X GET "http://localhost:3000/api/v1/payments?status=PENDING&sortBy=amount&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 🏢 Get Payments by Vendor
```bash
curl -X GET http://localhost:3000/api/v1/payments/vendor/VENDOR_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 🔍 Get Payment by ID
```bash
curl -X GET http://localhost:3000/api/v1/payments/PAYMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### ✏️ Update Payment (Mark as Paid)
```bash
curl -X PUT http://localhost:3000/api/v1/payments/PAYMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID",
    "paymentDate": "2025-01-07T14:30:00Z"
  }'
```

#### 📊 Get Payment Statistics
```bash
curl -X GET http://localhost:3000/api/v1/payments/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 🗑️ Delete Payment
```bash
curl -X DELETE http://localhost:3000/api/v1/payments/PAYMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Quick Test Sequence

1. **Login and get token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' | \
  jq -r '.token')

echo "Token: $TOKEN"
```

2. **Create a vendor:**
```bash
VENDOR_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "email": "test@vendor.com",
    "phone": "+1-555-0123",
    "address": "123 Test St",
    "contactName": "Test Contact"
  }')

VENDOR_ID=$(echo $VENDOR_RESPONSE | jq -r '.data.id')
echo "Vendor ID: $VENDOR_ID"
```

3. **Create a payment:**
```bash
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 500.00,
    \"description\": \"Test payment\",
    \"vendorId\": \"$VENDOR_ID\",
    \"dueDate\": \"2025-02-01T00:00:00Z\"
  }")

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.data.id')
echo "Payment ID: $PAYMENT_ID"
```

4. **View all vendors:**
```bash
curl -s -X GET http://localhost:3000/api/v1/vendors \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

5. **View all payments:**
```bash
curl -s -X GET http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## ❌ Error Testing

### Test Invalid Token
```bash
curl -X GET http://localhost:3000/api/v1/vendors \
  -H "Authorization: Bearer invalid_token"
```

### Test Duplicate Email
```bash
curl -X POST http://localhost:3000/api/v1/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Vendor",
    "email": "supplier1@example.com"
  }'
```

### Test Invalid Data
```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -100,
    "vendorId": "invalid_id"
  }'
```

---

## 📱 Testing with Postman

Import this collection:
1. Create new request
2. Set method and URL
3. Add Headers: `Authorization: Bearer YOUR_TOKEN`
4. Add JSON body for POST/PUT requests
5. Send request

---

## 🔧 Status Codes Reference

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

**Ready to test! 🚀**
