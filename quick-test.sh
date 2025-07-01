#!/bin/bash

echo "🧪 Testing Vendor Payment Management API"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}1. Testing Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -X GET $BASE_URL/health)
echo "Response: $HEALTH_RESPONSE"
echo ""

echo -e "${BLUE}2. Testing Admin Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Token received: ${TOKEN:0:20}...${NC}"
fi
echo ""

echo -e "${BLUE}3. Testing Create Vendor${NC}"
VENDOR_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Test Vendor",
    "email": "quicktest@example.com",
    "phone": "+1-555-9999",
    "address": "123 Test Street",
    "contactName": "Test Manager"
  }')

echo "Vendor Response: $VENDOR_RESPONSE"

# Extract vendor ID
VENDOR_ID=$(echo $VENDOR_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ -z "$VENDOR_ID" ]; then
    echo -e "${RED}❌ Failed to create vendor!${NC}"
else
    echo -e "${GREEN}✅ Vendor created with ID: $VENDOR_ID${NC}"
fi
echo ""

echo -e "${BLUE}4. Testing Get All Vendors${NC}"
VENDORS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/vendors?limit=5" \
  -H "Authorization: Bearer $TOKEN")
echo "Vendors Response: $VENDORS_RESPONSE"
echo ""

if [ ! -z "$VENDOR_ID" ]; then
    echo -e "${BLUE}5. Testing Create Payment${NC}"
    PAYMENT_RESPONSE=$(curl -s -X POST $BASE_URL/api/v1/payments \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"amount\": 750.50,
        \"description\": \"Quick test payment\",
        \"vendorId\": \"$VENDOR_ID\",
        \"dueDate\": \"2025-02-15T00:00:00Z\"
      }")

    echo "Payment Response: $PAYMENT_RESPONSE"

    # Extract payment ID
    PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    if [ -z "$PAYMENT_ID" ]; then
        echo -e "${RED}❌ Failed to create payment!${NC}"
    else
        echo -e "${GREEN}✅ Payment created with ID: $PAYMENT_ID${NC}"
    fi
    echo ""

    echo -e "${BLUE}6. Testing Get All Payments${NC}"
    PAYMENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/payments?limit=5" \
      -H "Authorization: Bearer $TOKEN")
    echo "Payments Response: $PAYMENTS_RESPONSE"
    echo ""

    echo -e "${BLUE}7. Testing Payment Statistics${NC}"
    STATS_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/payments/stats/overview \
      -H "Authorization: Bearer $TOKEN")
    echo "Stats Response: $STATS_RESPONSE"
    echo ""
fi

echo -e "${BLUE}8. Testing Error Handling (Invalid Token)${NC}"
ERROR_RESPONSE=$(curl -s -X GET $BASE_URL/api/v1/vendors \
  -H "Authorization: Bearer invalid_token")
echo "Error Response: $ERROR_RESPONSE"
echo ""

echo -e "${GREEN}🎉 Basic API testing completed!${NC}"
echo ""
echo "📝 What to test next:"
echo "  1. Use Postman/Insomnia for more detailed testing"
echo "  2. Test all CRUD operations"
echo "  3. Test pagination and filtering"
echo "  4. Test validation errors"
echo ""
echo "🔗 API Documentation: http://localhost:3000/"
echo "📊 Server Health: http://localhost:3000/health"
