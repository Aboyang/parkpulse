#!/usr/bin/env bash
# Quick script to verify IP rate limiting is working.
# Run with the server already started: npm run dev (in server/)

BASE_URL="${1:-http://localhost:3000}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

hit() {
  local label="$1"
  local method="$2"
  local url="$3"
  local body="$4"
  local count="$5"
  local expected_429_at="$6"

  echo ""
  echo "=== $label (limit: $((expected_429_at - 1))/min, sending $count requests) ==="

  for i in $(seq 1 "$count"); do
    if [ -n "$body" ]; then
      response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X "$method" "$url" \
        -H "Content-Type: application/json" \
        -d "$body")
    else
      response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X "$method" "$url")
    fi

    if [ "$response" = "429" ]; then
      echo -e "  Request $i: ${RED}$response BLOCKED${NC}"
    elif [ "$response" = "200" ] || [ "$response" = "201" ]; then
      echo -e "  Request $i: ${GREEN}$response OK${NC}"
    else
      echo -e "  Request $i: ${YELLOW}$response${NC}"
    fi
  done
}

# --- /api/carparks: limit 15/min ---
hit "GET /api/carparks" \
  GET "$BASE_URL/api/carparks?address=Raffles+Place&radius=500" \
  "" \
  18 16

echo ""
echo "=== Headers on a blocked request ==="
curl -si -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"attacker@test.com","password":"wrongpassword"}' \
  | grep -E "HTTP/|Retry-After|X-RateLimit"

echo ""
echo "Done. Wait 60s for windows to reset."
