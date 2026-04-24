#!/bin/bash

echo "========================================="
echo "  AI Home Interior Staging Platform"
echo "  Starting Application..."
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project directory
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Step 1: Kill processes on ports 3001 and 5173
echo -e "\n${YELLOW}[1/6] Cleaning up used ports...${NC}"
for PORT in 3001 3000; do
  PID=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    echo -e "  Killing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null
    sleep 1
  else
    echo -e "  Port $PORT is free"
  fi
done

# Step 2: Check PostgreSQL
echo -e "\n${YELLOW}[2/6] Checking PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
  echo -e "  ${RED}PostgreSQL is not running. Starting...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
  sleep 3
fi
echo -e "  ${GREEN}PostgreSQL is running${NC}"

# Step 3: Install dependencies
echo -e "\n${YELLOW}[3/6] Installing dependencies...${NC}"
npm install --silent 2>&1 | tail -1
cd client && npm install --silent 2>&1 | tail -1
cd "$DIR"
echo -e "  ${GREEN}Dependencies installed${NC}"

# Step 4: Setup database
echo -e "\n${YELLOW}[4/6] Setting up database...${NC}"
node server/db-setup.js
echo -e "  ${GREEN}Database setup complete${NC}"

# Step 5: Seed data
echo -e "\n${YELLOW}[5/6] Seeding database...${NC}"
node server/seed.js
echo -e "  ${GREEN}Database seeded${NC}"

# Step 6: Start application with hot reload
echo -e "\n${YELLOW}[6/6] Starting application with hot reload...${NC}"
echo -e "  ${BLUE}Backend:  http://localhost:3001${NC}"
echo -e "  ${BLUE}Frontend: http://localhost:3000${NC}"
echo ""
echo -e "  ${GREEN}Login Credentials:${NC}"
echo -e "  Email:    demo@staging.com"
echo -e "  Password: password123"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}"
echo "========================================="

# Start with concurrently (nodemon for backend hot reload, vite for frontend HMR)
npm start
