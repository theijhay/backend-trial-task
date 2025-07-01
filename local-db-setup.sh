#!/bin/bash

echo "🐘 Setting up Local PostgreSQL Database"
echo "======================================"

echo "Step 1: Install PostgreSQL"
echo "Run: sudo apt update && sudo apt install postgresql postgresql-contrib"
echo ""

echo "Step 2: Start PostgreSQL service"
echo "Run: sudo systemctl start postgresql"
echo "Run: sudo systemctl enable postgresql"
echo ""

echo "Step 3: Create database and user"
echo "Run these commands one by one:"
echo 'sudo -u postgres psql -c "CREATE DATABASE vendor_payment_db;"'
echo 'sudo -u postgres psql -c "CREATE USER vendorapi WITH PASSWORD '\''vendorapi123'\'';"'
echo 'sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vendor_payment_db TO vendorapi;"'
echo 'sudo -u postgres psql -c "ALTER USER vendorapi CREATEDB;"'
echo ""

echo "Step 4: Test connection"
echo "Run: psql -h localhost -U vendorapi -d vendor_payment_db"
echo "(Password: vendorapi123)"
echo ""

echo "If authentication fails, run:"
echo "sudo nano /etc/postgresql/*/main/pg_hba.conf"
echo "Change 'peer' to 'md5' for local connections, then:"
echo "sudo systemctl restart postgresql"
