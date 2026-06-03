#!/bin/bash

# =============================================================================
#  API Test Suite — Chat & Block
#  Usage: bash api-tests-chat.sh
#  Requires: curl, jq
# =============================================================================

BASE_URL="http://localhost:3000"
COOKIE_ALICE=$(mktemp)
COOKIE_BOB=$(mktemp)
COOKIE_CHARLIE=$(mktemp)

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✔ $1${NC}"; }
fail() { echo -e "  ${RED}✘ $1${NC}"; }
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }
info() { echo -e "  ${YELLOW}→ $1${NC}"; }

check() {
  local json="$1" field="$2" expected="$3" label="$4"
  local actual
  actual=$(echo "$json" | jq -r "$field" 2>/dev/null)
  if [ "$actual" = "$expected" ]; then
    pass "$label (got: $actual)"
  else
    fail "$label (expected: $expected, got: $actual)"
  fi
}

check_present() {
  local json="$1" field="$2" label="$3"
  local actual
  actual=$(echo "$json" | jq -r "$field" 2>/dev/null)
  if [ "$actual" != "null" ] && [ -n "$actual" ]; then
    pass "$label (got: $actual)"
  else
    fail "$label (expected a value, got null or empty)"
  fi
}

# =============================================================================
section "SETUP"
# =============================================================================

info "Register alice, bob, charlie"
curl -s -X POST "$BASE_URL/users" -H "Content-Type: application/json" \
  -d '{"username":"alice","publicUsername":"Alice","email":"alice@test.com","password":"password123"}' > /dev/null
curl -s -X POST "$BASE_URL/users" -H "Content-Type: application/json" \
  -d '{"username":"bob","publicUsername":"Bob","email":"bob@test.com","password":"password123"}' > /dev/null
curl -s -X POST "$BASE_URL/users" -H "Content-Type: application/json" \
  -d '{"username":"charlie","publicUsername":"Charlie","email":"charlie@test.com","password":"password123"}' > /dev/null

info "Login all three"
curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
  -c "$COOKIE_ALICE" -d '{"email":"alice@test.com","password":"password123"}' > /dev/null
curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
  -c "$COOKIE_BOB" -d '{"email":"bob@test.com","password":"password123"}' > /dev/null
curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
  -c "$COOKIE_CHARLIE" -d '{"email":"charlie@test.com","password":"password123"}' > /dev/null

ALICE_ID=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_ALICE" | jq -r '.id')
BOB_ID=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_BOB" | jq -r '.id')
CHARLIE_ID=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_CHARLIE" | jq -r '.id')
info "IDs: alice=$ALICE_ID bob=$BOB_ID charlie=$CHARLIE_ID"

# =============================================================================
section "FRIENDSHIP — Setup (alice+bob, alice+charlie)"
# =============================================================================

info "Alice sends request to bob"
curl -s -X POST "$BASE_URL/friends/request/$BOB_ID" -b "$COOKIE_ALICE" > /dev/null

info "Bob accepts"
F_ALICE_BOB=$(curl -s "$BASE_URL/friends/pending" -b "$COOKIE_BOB" | jq -r '.[0].id')
RES=$(curl -s -X POST "$BASE_URL/friends/accept/$F_ALICE_BOB" -b "$COOKIE_BOB")
check "$RES" ".status" "ACCEPTED" "alice-bob friendship accepted"

info "Alice sends request to charlie"
curl -s -X POST "$BASE_URL/friends/request/$CHARLIE_ID" -b "$COOKIE_ALICE" > /dev/null

info "Charlie accepts"
F_ALICE_CHARLIE=$(curl -s "$BASE_URL/friends/pending" -b "$COOKIE_CHARLIE" | jq -r '.[0].id')
RES=$(curl -s -X POST "$BASE_URL/friends/accept/$F_ALICE_CHARLIE" -b "$COOKIE_CHARLIE")
check "$RES" ".status" "ACCEPTED" "alice-charlie friendship accepted"

# =============================================================================
section "CONVERSATIONS — Created on accept"
# =============================================================================

info "GET /conversations — alice sees 2 conversations"
RES=$(curl -s "$BASE_URL/conversations" -b "$COOKIE_ALICE")
echo "$RES" | jq .
COUNT=$(echo "$RES" | jq 'length')
if [ "$COUNT" = "2" ]; then
  pass "Alice has 2 conversations"
else
  fail "Expected 2 conversations, got $COUNT"
fi
check_present "$RES" ".[0].id" "conversation id present"
check_present "$RES" ".[0].friend.username" "friend username present"
check_present "$RES" ".[0].friend.publicUsername" "friend publicUsername present"

CONV_ALICE_BOB=$(curl -s "$BASE_URL/conversations" -b "$COOKIE_ALICE" | jq -r '.[] | select(.friend.username == "bob") | .id')
CONV_ALICE_CHARLIE=$(curl -s "$BASE_URL/conversations" -b "$COOKIE_ALICE" | jq -r '.[] | select(.friend.username == "charlie") | .id')
info "Conversation IDs: alice-bob=$CONV_ALICE_BOB alice-charlie=$CONV_ALICE_CHARLIE"

info "GET /conversations — bob sees 1 conversation"
RES=$(curl -s "$BASE_URL/conversations" -b "$COOKIE_BOB")
COUNT=$(echo "$RES" | jq 'length')
[ "$COUNT" = "1" ] && pass "Bob has 1 conversation" || fail "Expected 1, got $COUNT"

# =============================================================================
section "MESSAGES — REST history"
# =============================================================================

info "GET /conversations/$CONV_ALICE_BOB/messages — empty initially"
RES=$(curl -s "$BASE_URL/conversations/$CONV_ALICE_BOB/messages" -b "$COOKIE_ALICE")
echo "$RES" | jq .
COUNT=$(echo "$RES" | jq 'length')
[ "$COUNT" = "0" ] && pass "No messages yet" || fail "Expected 0 messages, got $COUNT"

info "GET /conversations/$CONV_ALICE_BOB/messages?limit=10 — custom limit"
RES=$(curl -s "$BASE_URL/conversations/$CONV_ALICE_BOB/messages?limit=10" -b "$COOKIE_ALICE")
check "$RES" "type" "null" "valid response (array)"

# =============================================================================
section "MESSAGES — Errors"
# =============================================================================

info "GET /conversations/$CONV_ALICE_BOB/messages — charlie tries to access alice+bob conversation"
RES=$(curl -s "$BASE_URL/conversations/$CONV_ALICE_BOB/messages" -b "$COOKIE_CHARLIE")
echo "$RES" | jq .
check "$RES" ".code" "FORBIDDEN" "charlie cannot access alice-bob conversation"
check "$RES" ".statusCode" "403" "statusCode is 403"

info "GET /conversations/99999/messages — non-existent conversation"
RES=$(curl -s "$BASE_URL/conversations/99999/messages" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".code" "NOT_FOUND" "code is NOT_FOUND"
check "$RES" ".statusCode" "404" "statusCode is 404"

info "GET /conversations/$CONV_ALICE_BOB/messages — without auth"
RES=$(curl -s "$BASE_URL/conversations/$CONV_ALICE_BOB/messages")
echo "$RES" | jq .
check "$RES" ".code" "UNAUTHORIZED" "code is UNAUTHORIZED"

info "GET /conversations/$CONV_ALICE_BOB/messages?limit=0 — invalid limit"
RES=$(curl -s "$BASE_URL/conversations/$CONV_ALICE_BOB/messages?limit=0" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "limit=0 rejected"

info "GET /conversations/$CONV_ALICE_BOB/messages?limit=201 — limit too high"
RES=$(curl -s "$BASE_URL/conversations/$CONV_ALICE_BOB/messages?limit=201" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "limit=201 rejected"

# =============================================================================
section "BLOCK — Conversation deleted on block"
# =============================================================================

info "Alice blocks charlie (friendship id=$F_ALICE_CHARLIE)"
RES=$(curl -s -X POST "$BASE_URL/friends/block/$F_ALICE_CHARLIE" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".status" "BLOCKED" "status is BLOCKED"

info "GET /conversations — alice no longer sees charlie conversation"
RES=$(curl -s "$BASE_URL/conversations" -b "$COOKIE_ALICE")
echo "$RES" | jq .
COUNT=$(echo "$RES" | jq 'length')
[ "$COUNT" = "1" ] && pass "Alice now has 1 conversation (charlie removed)" || fail "Expected 1, got $COUNT"

info "GET /conversations/$CONV_ALICE_CHARLIE/messages — conversation no longer accessible"
RES=$(curl -s "$BASE_URL/conversations/$CONV_ALICE_CHARLIE/messages" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".code" "NOT_FOUND" "conversation deleted after block"

# =============================================================================
section "BLOCK — Errors"
# =============================================================================

info "Block already blocked friendship"
RES=$(curl -s -X POST "$BASE_URL/friends/block/$F_ALICE_CHARLIE" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".code" "FRIENDSHIP_CANNOT_BLOCK" "cannot block twice"
check "$RES" ".statusCode" "409" "statusCode is 409"

info "Block non-existent friendship"
RES=$(curl -s -X POST "$BASE_URL/friends/block/99999" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".code" "NOT_FOUND" "code is NOT_FOUND"

# =============================================================================
section "Cleanup"
# =============================================================================
rm -f "$COOKIE_ALICE" "$COOKIE_BOB" "$COOKIE_CHARLIE"
pass "Temp files removed"
echo ""