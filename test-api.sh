#!/bin/bash

# API Testing Script for Vendor Payment Management API
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000/api/v1"
TOKEN=""

echo "🚀 Testing Vendor Payment Management API"
echo "========================================"

# Health Check
echo "1. Health Check"
curl -s -X GET http://localhost:3000/health | jq '.'
echo ""

# Register a new user
echo "2. Register new user"
REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User",
    "role": "ADMIN"
  }')

echo $REGISTER_RESPONSE | jq '.'
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"
echo ""

# Login (alternative way to get token)
echo "3. Login"
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo $LOGIN_RESPONSE | jq '.'
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
fi
echo ""

# Get user profile
echo "4. Get user profile"
curl -s -X GET ${BASE_URL}/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Create a vendor
echo "5. Create vendor"
VENDOR_RESPONSE=$(curl -s -X POST ${BASE_URL}/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor Ltd",
    "email": "vendor@test.com",
    "phone": "+1-555-9999",
    "address": "123 Test Street, Test City, TC 12345",
    "contactName": "Test Contact",
    "status": "ACTIVE"
  }')

echo $VENDOR_RESPONSE | jq '.'
VENDOR_ID=$(echo $VENDOR_RESPONSE | jq -r '.data.id')
echo "Vendor ID: $VENDOR_ID"
echo ""

# Get all vendors
echo "6. Get all vendors"
curl -s -X GET "${BASE_URL}/vendors?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Get vendor by ID
echo "7. Get vendor by ID"
curl -s -X GET ${BASE_URL}/vendors/$VENDOR_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Create a payment
echo "8. Create payment"
PAYMENT_RESPONSE=$(curl -s -X POST ${BASE_URL}/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 750.50,
    \"description\": \"Test payment for services\",
    \"vendorId\": \"$VENDOR_ID\",
    \"dueDate\": \"2025-02-01T00:00:00Z\",
    \"status\": \"PENDING\"
  }")

echo $PAYMENT_RESPONSE | jq '.'
PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.data.id')
echo "Payment ID: $PAYMENT_ID"
echo ""

# Get all payments
echo "9. Get all payments"
curl -s -X GET "${BASE_URL}/payments?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Get payments by vendor
echo "10. Get payments by vendor"
curl -s -X GET ${BASE_URL}/payments/vendor/$VENDOR_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Get payment by ID
echo "11. Get payment by ID"
curl -s -X GET ${BASE_URL}/payments/$PAYMENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Update payment
echo "12. Update payment"
curl -s -X PUT ${BASE_URL}/payments/$PAYMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID",
    "paymentDate": "2024-12-20T10:30:00Z"
  }' | jq '.'
echo ""

# Get payment statistics
echo "13. Get payment statistics"
curl -s -X GET ${BASE_URL}/payments/stats/overview \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Update vendor
echo "14. Update vendor"
curl -s -X PUT ${BASE_URL}/vendors/$VENDOR_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Vendor Ltd",
    "status": "ACTIVE"
  }' | jq '.'
echo ""

echo "✅ API testing completed!"
echo "Note: You can now delete the test records if needed:"
echo "- DELETE ${BASE_URL}/payments/$PAYMENT_ID"
echo "- DELETE ${BASE_URL}/vendors/$VENDOR_ID"
