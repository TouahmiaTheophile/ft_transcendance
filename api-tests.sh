#!/bin/bash

# =============================================================================
#  API Test Suite
#  Usage: bash api-tests.sh
#  Requires: curl, jq
# =============================================================================

BASE_URL="http://localhost:3000"
COOKIE_JAR=$(mktemp)
COOKIE_JAR_2=$(mktemp)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✔ $1${NC}"; }
fail() { echo -e "  ${RED}✘ $1${NC}"; }
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }
info() { echo -e "  ${YELLOW}→ $1${NC}"; }

check_field() {
  local json="$1" field="$2" expected="$3" label="$4"
  local actual
  actual=$(echo "$json" | jq -r "$field" 2>/dev/null)
  if [ "$actual" = "$expected" ]; then
    pass "$label (got: $actual)"
  else
    fail "$label (expected: $expected, got: $actual)"
  fi
}

# =============================================================================
section "USERS — Registration"
# =============================================================================

info "POST /users — valid registration (user 1)"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".username" "alice" "username matches"
check_field "$RES" ".email" "alice@test.com" "email matches"
check_field "$RES" ".id" "null" "no id leak" 2>/dev/null || \
check_field "$RES" ".passwordHash" "null" "no passwordHash leak"
USER1_ID=$(echo "$RES" | jq -r '.id')

info "POST /users — valid registration (user 2)"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@test.com","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".username" "bob" "username matches"
USER2_ID=$(echo "$RES" | jq -r '.id')

info "POST /users — valid registration (user 3)"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"charlie","email":"charlie@test.com","password":"password123"}')
echo "$RES" | jq .
USER3_ID=$(echo "$RES" | jq -r '.id')

info "User IDs: alice=$USER1_ID, bob=$USER2_ID, charlie=$USER3_ID"

# =============================================================================
section "USERS — Read"
# =============================================================================

info "GET /users — list all users"
RES=$(curl -s "$BASE_URL/users")
echo "$RES" | jq .
COUNT=$(echo "$RES" | jq 'length')
if [ "$COUNT" -ge 3 ]; then
  pass "At least 3 users returned ($COUNT)"
else
  fail "Expected at least 3 users, got $COUNT"
fi

# =============================================================================
section "AUTH — Login"
# =============================================================================

info "POST /auth/login — alice login (saves cookies)"
RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d '{"email":"alice@test.com","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".success" "true" "login success"

info "POST /auth/login — bob login (saves cookies)"
RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR_2" \
  -d '{"email":"bob@test.com","password":"password123"}')
check_field "$RES" ".success" "true" "bob login success"

# =============================================================================
section "AUTH — Protected routes"
# =============================================================================

info "GET /users/me — with valid access token (alice)"
RES=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".username" "alice" "returns alice's profile"

info "POST /auth/refresh — rotate tokens (alice)"
RES=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -b "$COOKIE_JAR" \
  -c "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".success" "true" "token rotation success"

info "GET /users/me — after token rotation (alice)"
RES=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".username" "alice" "still authenticated after rotation"

# =============================================================================
section "FRIENDS — Send requests"
# =============================================================================

info "POST /friends/request/$USER2_ID — alice sends request to bob"
RES=$(curl -s -X POST "$BASE_URL/friends/request/$USER2_ID" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".status" "PENDING" "status is PENDING"
check_field "$RES" ".requesterId" "$USER1_ID" "requesterId is alice"
check_field "$RES" ".addresseeId" "$USER2_ID" "addresseeId is bob"
FRIENDSHIP1_ID=$(echo "$RES" | jq -r '.id')

info "POST /friends/request/$USER3_ID — alice sends request to charlie"
RES=$(curl -s -X POST "$BASE_URL/friends/request/$USER3_ID" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".status" "PENDING" "status is PENDING"
FRIENDSHIP2_ID=$(echo "$RES" | jq -r '.id')

info "Friendship IDs: alice-bob=$FRIENDSHIP1_ID, alice-charlie=$FRIENDSHIP2_ID"

# =============================================================================
section "FRIENDS — List pending"
# =============================================================================

info "GET /friends/pending — bob sees pending requests"
RES=$(curl -s "$BASE_URL/friends/pending" -b "$COOKIE_JAR_2")
echo "$RES" | jq .
COUNT=$(echo "$RES" | jq 'length')
if [ "$COUNT" -ge 1 ]; then
  pass "Bob has $COUNT pending request(s)"
else
  fail "Expected pending requests for bob"
fi

# =============================================================================
section "FRIENDS — Accept / Reject"
# =============================================================================

info "POST /friends/accept/$FRIENDSHIP1_ID — bob accepts alice's request"
RES=$(curl -s -X POST "$BASE_URL/friends/accept/$FRIENDSHIP1_ID" -b "$COOKIE_JAR_2")
echo "$RES" | jq .
check_field "$RES" ".status" "ACCEPTED" "status is ACCEPTED"

info "POST /friends/reject/$FRIENDSHIP2_ID — charlie rejects alice's request (charlie login first)"
RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/cookie_charlie \
  -d '{"email":"charlie@test.com","password":"password123"}')
RES=$(curl -s -X POST "$BASE_URL/friends/reject/$FRIENDSHIP2_ID" -b /tmp/cookie_charlie)
echo "$RES" | jq .
check_field "$RES" ".status" "REJECTED" "status is REJECTED"

# =============================================================================
section "FRIENDS — List friends"
# =============================================================================

info "GET /friends — alice's friend list"
RES=$(curl -s "$BASE_URL/friends" -b "$COOKIE_JAR")
echo "$RES" | jq .
COUNT=$(echo "$RES" | jq 'length')
if [ "$COUNT" -ge 1 ]; then
  pass "Alice has $COUNT friend(s)"
else
  fail "Expected at least 1 friend for alice"
fi
check_field "$RES" ".[0].friend.username" "bob" "friend is bob"

# =============================================================================
section "AUTH — Logout"
# =============================================================================

info "POST /auth/logout — alice logs out"
RES=$(curl -s -X POST "$BASE_URL/auth/logout" -b "$COOKIE_JAR" -c "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".success" "true" "logout success"

info "GET /users/me — after logout (should fail)"
RES=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".code" "UNAUTHORIZED" "access denied after logout"

info "POST /auth/refresh — after logout (should fail)"
RES=$(curl -s -X POST "$BASE_URL/auth/refresh" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".code" "UNAUTHORIZED" "refresh denied after logout"

# =============================================================================
section "ERRORS — Validation"
# =============================================================================

info "POST /users — empty body"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{}')
echo "$RES" | jq .
check_field "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"
check_field "$RES" ".statusCode" "400" "statusCode is 400"
HAS_FIELDS=$(echo "$RES" | jq 'has("details") and (.details | has("fields"))')
[ "$HAS_FIELDS" = "true" ] && pass "details.fields present" || fail "details.fields missing"

info "POST /users — invalid email"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"not-an-email","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"

info "POST /users — password too short"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"short"}')
echo "$RES" | jq .
check_field "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"

info "POST /users — username too short"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","email":"test@test.com","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"

info "POST /users — unknown field (whitelist)"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123","hacked":true}')
echo "$RES" | jq .
check_field "$RES" ".code" "VALIDATION_ERROR" "unknown field rejected"

# =============================================================================
section "ERRORS — Auth"
# =============================================================================

info "POST /auth/login — wrong password"
RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"wrongpassword"}')
echo "$RES" | jq .
check_field "$RES" ".code" "UNAUTHORIZED" "code is UNAUTHORIZED"
check_field "$RES" ".statusCode" "401" "statusCode is 401"

info "POST /auth/login — unknown email"
RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ghost@test.com","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".code" "UNAUTHORIZED" "code is UNAUTHORIZED"

info "GET /users/me — no token"
RES=$(curl -s "$BASE_URL/users/me")
echo "$RES" | jq .
check_field "$RES" ".code" "UNAUTHORIZED" "code is UNAUTHORIZED"
check_field "$RES" ".statusCode" "401" "statusCode is 401"

info "POST /auth/refresh — no refresh token"
RES=$(curl -s -X POST "$BASE_URL/auth/refresh")
echo "$RES" | jq .
check_field "$RES" ".code" "UNAUTHORIZED" "missing refresh token rejected"

# =============================================================================
section "ERRORS — Unique constraints"
# =============================================================================

info "POST /users — duplicate username"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"other@test.com","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".code" "UNIQUE_CONSTRAINT" "code is UNIQUE_CONSTRAINT"
check_field "$RES" ".statusCode" "409" "statusCode is 409"

info "POST /users — duplicate email"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice2","email":"alice@test.com","password":"password123"}')
echo "$RES" | jq .
check_field "$RES" ".code" "UNIQUE_CONSTRAINT" "code is UNIQUE_CONSTRAINT"

# =============================================================================
section "ERRORS — Friendship domain"
# =============================================================================

info "POST /auth/login — alice re-login for domain error tests"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d '{"email":"alice@test.com","password":"password123"}' > /dev/null

info "POST /friends/request/$USER1_ID — alice sends request to herself"
RES=$(curl -s -X POST "$BASE_URL/friends/request/$USER1_ID" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".code" "FRIENDSHIP_SELF_REQUEST" "code is FRIENDSHIP_SELF_REQUEST"
check_field "$RES" ".statusCode" "400" "statusCode is 400"

info "POST /friends/request/$USER2_ID — alice sends duplicate request to bob"
RES=$(curl -s -X POST "$BASE_URL/friends/request/$USER2_ID" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".code" "FRIENDSHIP_ALREADY_EXISTS" "code is FRIENDSHIP_ALREADY_EXISTS"
check_field "$RES" ".statusCode" "409" "statusCode is 409"

info "POST /friends/accept/$FRIENDSHIP1_ID — alice tries to accept her own sent request"
RES=$(curl -s -X POST "$BASE_URL/friends/accept/$FRIENDSHIP1_ID" -b "$COOKIE_JAR")
echo "$RES" | jq .
check_field "$RES" ".code" "FRIENDSHIP_FORBIDDEN" "code is FRIENDSHIP_FORBIDDEN"
check_field "$RES" ".statusCode" "403" "statusCode is 403"

info "POST /friends/accept/$FRIENDSHIP1_ID — bob tries to accept an already accepted request"
RES=$(curl -s -X POST "$BASE_URL/friends/accept/$FRIENDSHIP1_ID" -b "$COOKIE_JAR_2")
echo "$RES" | jq .
check_field "$RES" ".code" "FRIENDSHIP_NOT_PENDING" "code is FRIENDSHIP_NOT_PENDING"
check_field "$RES" ".statusCode" "409" "statusCode is 409"

info "POST /friends/accept/99999 — accept non-existent friendship"
RES=$(curl -s -X POST "$BASE_URL/friends/accept/99999" -b "$COOKIE_JAR_2")
echo "$RES" | jq .
check_field "$RES" ".code" "NOT_FOUND" "code is NOT_FOUND"
check_field "$RES" ".statusCode" "404" "statusCode is 404"

# =============================================================================
section "ERRORS — Malformed requests"
# =============================================================================

info "POST /users — malformed JSON"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{invalid json}')
echo "$RES" | jq .
check_field "$RES" ".code" "BAD_REQUEST" "malformed JSON rejected"
check_field "$RES" ".statusCode" "400" "statusCode is 400"

info "GET /nonexistent — unknown route"
RES=$(curl -s "$BASE_URL/nonexistent")
echo "$RES" | jq .
check_field "$RES" ".statusCode" "404" "404 on unknown route"

# =============================================================================
echo -e "\n${BLUE}━━━ Cleanup ━━━${NC}"
rm -f "$COOKIE_JAR" "$COOKIE_JAR_2" /tmp/cookie_charlie
pass "Temp cookie files removed"
echo ""
