#!/usr/bin/env bash
# Upload a media file to Verlynk via Public API presign.
# Usage: ./upload-media.sh <file-path> [profile-id]
#
# Requires:
#   VERLYNK_API_KEY — Public API key with posts:write scope
#   VERLYNK_API_URL — optional, defaults to https://verlynk.com/api

set -euo pipefail

FILE_PATH="${1:?Usage: $0 <file-path> [profile-id]}"
PROFILE_ID="${2:-}"

API_URL="${VERLYNK_API_URL:-https://verlynk.com/api}"
API_KEY="${VERLYNK_API_KEY:?Set VERLYNK_API_KEY (posts:write scope)}"

if [[ ! -f "$FILE_PATH" ]]; then
  echo "Error: file not found: $FILE_PATH" >&2
  exit 1
fi

FILENAME="$(basename "$FILE_PATH")"
FILE_SIZE="$(wc -c < "$FILE_PATH" | tr -d ' ')"

case "${FILENAME##*.}" in
  jpg|jpeg) CONTENT_TYPE="image/jpeg" ;;
  png)      CONTENT_TYPE="image/png" ;;
  gif)      CONTENT_TYPE="image/gif" ;;
  webp)     CONTENT_TYPE="image/webp" ;;
  mp4)      CONTENT_TYPE="video/mp4" ;;
  mov)      CONTENT_TYPE="video/quicktime" ;;
  webm)     CONTENT_TYPE="video/webm" ;;
  pdf)      CONTENT_TYPE="application/pdf" ;;
  *)
    echo "Error: unsupported file extension: ${FILENAME##*.}" >&2
    exit 1
    ;;
esac

QUERY=""
if [[ -n "$PROFILE_ID" ]]; then
  QUERY="?profileId=${PROFILE_ID}"
fi

echo "Requesting presigned URL for $FILENAME ($CONTENT_TYPE, ${FILE_SIZE} bytes)..." >&2

PRESIGN_RESPONSE="$(curl -s -X POST "${API_URL}/v1/media/presign${QUERY}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"filename\":\"${FILENAME}\",\"contentType\":\"${CONTENT_TYPE}\",\"size\":${FILE_SIZE}}")"

UPLOAD_URL="$(echo "$PRESIGN_RESPONSE" | jq -r '.uploadUrl // empty')"
PUBLIC_URL="$(echo "$PRESIGN_RESPONSE" | jq -r '.publicUrl // empty')"

if [[ -z "$UPLOAD_URL" || "$UPLOAD_URL" == "null" ]]; then
  echo "Error: presign failed:" >&2
  echo "$PRESIGN_RESPONSE" | jq . >&2
  exit 1
fi

echo "Uploading to presigned URL..." >&2
curl -s -X PUT "$UPLOAD_URL" \
  -H "Content-Type: ${CONTENT_TYPE}" \
  --data-binary @"$FILE_PATH"

echo "Upload complete." >&2
echo "$PRESIGN_RESPONSE" | jq '{publicUrl, key, type}'
