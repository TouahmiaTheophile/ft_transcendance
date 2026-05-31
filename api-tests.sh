#!/bin/bash

# =============================================================================
#  API Test Suite v2 — Users CRUD + publicUsername
#  Usage: bash api-tests-v2.sh
#  Requires: curl, jq
# =============================================================================

BASE_URL="http://localhost:3000"
COOKIE_ALICE=$(mktemp)
COOKIE_BOB=$(mktemp)

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

check_null() {
  local json="$1" field="$2" label="$3"
  local actual
  actual=$(echo "$json" | jq -r "$field" 2>/dev/null)
  if [ "$actual" = "null" ] || [ -z "$actual" ]; then
    pass "$label (not exposed)"
  else
    fail "$label (should be absent, got: $actual)"
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
section "SETUP — Register users"
# =============================================================================

info "POST /users — alice (username + publicUsername)"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","publicUsername":"Alice Wonder","email":"alice@test.com","password":"password123"}')
echo "$RES" | jq .
check "$RES" ".username" "alice" "username"
check "$RES" ".publicUsername" "Alice Wonder" "publicUsername"
check "$RES" ".email" "alice@test.com" "email"
check_null "$RES" ".passwordHash" "passwordHash not exposed"
ALICE_ID=$(echo "$RES" | jq -r '.id')

info "POST /users — bob"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","publicUsername":"Bobby B","email":"bob@test.com","password":"password123"}')
echo "$RES" | jq .
check "$RES" ".publicUsername" "Bobby B" "publicUsername"
BOB_ID=$(echo "$RES" | jq -r '.id')

info "POST /auth/login — alice"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_ALICE" \
  -d '{"email":"alice@test.com","password":"password123"}' > /dev/null

info "POST /auth/login — bob"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_BOB" \
  -d '{"email":"bob@test.com","password":"password123"}' > /dev/null

info "User IDs: alice=$ALICE_ID, bob=$BOB_ID"

# =============================================================================
section "USERS — GET"
# =============================================================================

info "GET /users — publicUsername present in list"
RES=$(curl -s "$BASE_URL/users")
echo "$RES" | jq .
check "$RES" ".[0].publicUsername" "Alice Wonder" "publicUsername in list"
check_null "$RES" ".[0].passwordHash" "passwordHash not in list"

info "GET /users/me — publicUsername present"
RES=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".username" "alice" "username"
check "$RES" ".publicUsername" "Alice Wonder" "publicUsername"

# =============================================================================
section "USERS — PATCH /users/me"
# =============================================================================

info "PATCH — update publicUsername only (no password required)"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"publicUsername":"Alice W."}')
echo "$RES" | jq .
check "$RES" ".publicUsername" "Alice W." "publicUsername updated"
check "$RES" ".username" "alice" "username unchanged"

info "PATCH — update email with correct password"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"email":"alice-new@test.com","currentPassword":"password123"}')
echo "$RES" | jq .
check "$RES" ".email" "alice-new@test.com" "email updated"

info "PATCH — update password with correct current password"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"newPassword":"newpassword123","currentPassword":"password123"}')
echo "$RES" | jq .
check "$RES" ".username" "alice" "response valid after password change"

info "GET /users/me — re-login with new password to verify"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_ALICE" \
  -d '{"email":"alice-new@test.com","password":"newpassword123"}' > /dev/null
RES=$(curl -s "$BASE_URL/users/me" -b "$COOKIE_ALICE")
check "$RES" ".username" "alice" "authenticated with new credentials"

info "PATCH — update publicUsername + email in one request"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"publicUsername":"Alice Final","email":"alice@test.com","currentPassword":"newpassword123"}')
echo "$RES" | jq .
check "$RES" ".publicUsername" "Alice Final" "publicUsername updated"
check "$RES" ".email" "alice@test.com" "email updated"

# =============================================================================
section "USERS — Friends include publicUsername"
# =============================================================================

info "POST /friends/request/$BOB_ID — alice sends request"
curl -s -X POST "$BASE_URL/friends/request/$BOB_ID" -b "$COOKIE_ALICE" > /dev/null

info "POST /friends/accept — bob accepts"
FRIENDSHIP_ID=$(curl -s "$BASE_URL/friends/pending" -b "$COOKIE_BOB" | jq -r '.[0].id')
curl -s -X POST "$BASE_URL/friends/accept/$FRIENDSHIP_ID" -b "$COOKIE_BOB" > /dev/null

info "GET /friends — publicUsername present in friend response"
RES=$(curl -s "$BASE_URL/friends" -b "$COOKIE_ALICE")
echo "$RES" | jq .
check "$RES" ".[0].friend.publicUsername" "Bobby B" "friend.publicUsername present"
check_null "$RES" ".[0].friend.passwordHash" "friend.passwordHash not exposed"

# =============================================================================
section "ERRORS — PATCH validation"
# =============================================================================

info "PATCH — email without currentPassword"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"email":"no-password@test.com"}')
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"
check "$RES" ".statusCode" "400" "statusCode is 400"
check_present "$RES" ".details.fields.currentPassword" "currentPassword error in details"

info "PATCH — newPassword without currentPassword"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"newPassword":"newpassword456"}')
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"
check_present "$RES" ".details.fields.currentPassword" "currentPassword error in details"

info "PATCH — wrong currentPassword"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"email":"other@test.com","currentPassword":"wrongpassword"}')
echo "$RES" | jq .
check "$RES" ".code" "INVALID_CREDENTIALS" "code is INVALID_CREDENTIALS"
check "$RES" ".statusCode" "401" "statusCode is 401"
check "$RES" ".details.field" "password" "details.field is password"

info "PATCH — publicUsername too short"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{"publicUsername":"ab"}')
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"
check_present "$RES" ".details.fields.publicUsername" "publicUsername error in details"

info "PATCH — empty body (nothing to update)"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_ALICE" \
  -d '{}')
echo "$RES" | jq .
check "$RES" ".username" "alice" "empty patch returns current user unchanged"

info "PATCH — without auth"
RES=$(curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -d '{"publicUsername":"hacker"}')
echo "$RES" | jq .
check "$RES" ".code" "UNAUTHORIZED" "code is UNAUTHORIZED"
check "$RES" ".statusCode" "401" "statusCode is 401"

# =============================================================================
section "ERRORS — Registration validation"
# =============================================================================

info "POST /users — missing publicUsername"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}')
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"
check_present "$RES" ".details.fields.publicUsername" "publicUsername error in details"

info "POST /users — invalid publicUsername characters"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","publicUsername":"<script>","email":"test@test.com","password":"password123"}')
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "invalid characters rejected"

info "POST /users — duplicate username"
RES=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","publicUsername":"Other Alice","email":"other@test.com","password":"password123"}')
echo "$RES" | jq .
check "$RES" ".code" "UNIQUE_CONSTRAINT" "code is UNIQUE_CONSTRAINT"
check "$RES" ".statusCode" "409" "statusCode is 409"
check "$RES" ".details.fields[0]" "username" "details.fields contains username"

# =============================================================================
section "USERS — DELETE /users/me"
# =============================================================================

info "DELETE — wrong password"
RES=$(curl -s -X DELETE "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_BOB" \
  -d '{"password":"wrongpassword"}')
echo "$RES" | jq .
check "$RES" ".code" "INVALID_CREDENTIALS" "code is INVALID_CREDENTIALS"
check "$RES" ".details.field" "password" "details.field is password"

info "DELETE — missing password"
RES=$(curl -s -X DELETE "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_BOB" \
  -d '{}')
echo "$RES" | jq .
check "$RES" ".code" "VALIDATION_ERROR" "code is VALIDATION_ERROR"
check_present "$RES" ".details.fields.password" "password error in details"

info "DELETE — without auth"
RES=$(curl -s -X DELETE "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -d '{"password":"password123"}')
echo "$RES" | jq .
check "$RES" ".code" "UNAUTHORIZED" "code is UNAUTHORIZED"

info "DELETE — bob deletes his account with correct password"
RES=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/users/me" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_BOB" \
  -d '{"password":"password123"}')
if [ "$RES" = "204" ]; then
  pass "204 No Content returned"
else
  fail "Expected 204, got $RES"
fi

info "GET /users — bob no longer in list"
RES=$(curl -s "$BASE_URL/users")
BOB_STILL_EXISTS=$(echo "$RES" | jq '[.[] | select(.username == "bob")] | length')
if [ "$BOB_STILL_EXISTS" = "0" ]; then
  pass "bob removed from user list"
else
  fail "bob still exists (cascade delete may have failed)"
fi

info "GET /friends — alice's friend list after bob deletion (cascade)"
RES=$(curl -s "$BASE_URL/friends" -b "$COOKIE_ALICE")
echo "$RES" | jq .
FRIEND_COUNT=$(echo "$RES" | jq 'length')
if [ "$FRIEND_COUNT" = "0" ]; then
  pass "Friendship cascade deleted with bob"
else
  fail "Expected 0 friends after bob deletion, got $FRIEND_COUNT"
fi

# =============================================================================
section "Cleanup"
# =============================================================================
rm -f "$COOKIE_ALICE" "$COOKIE_BOB"
pass "Temp files removed"
echo ""