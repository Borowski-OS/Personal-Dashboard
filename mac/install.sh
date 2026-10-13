#!/bin/bash
# Life OS Mail — Mac agent installer (Apple Mail → Life OS). Plain-English steps are in README.md next to this file.
#   bash install.sh <KEY>         install or update (the key comes from the Life OS Mail page; later runs reuse the saved key)
#   bash install.sh --status      what the agent sees and when it last synced
#   bash install.sh --uninstall   stop it and remove everything it installed
# Straight from the web:  curl -fsSL https://borowski-os.github.io/Personal-Dashboard/mac/install.sh | bash -s -- <KEY>
# Safe to run again any time. No keys or personal data live in this file.
set -euo pipefail

LABEL="com.lifeos.mail"
DIR="$HOME/Library/Application Support/LifeOSMail"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/LifeOSMail.log"
BASE="${LIFEOS_BASE:-https://borowski-os.github.io/Personal-Dashboard}"
BRAIN="${LIFEOS_BRAIN:-https://script.google.com/macros/s/AKfycbwdO_d4gj2Rj_cLM7JFvehuRUHuwFFocaxJz0MwJxKYhECksIHVe3p3VdhbgjKioWd-/exec}"

say() { printf '%s\n' "$*"; }
die() { printf '\nLife OS Mail: %s\n' "$*" >&2; exit 1; }
xml() { local s=$1; s=${s//&/&amp;}; s=${s//</&lt;}; s=${s//>/&gt;}; printf '%s' "$s"; }
size() { stat -f %z "$1" 2>/dev/null || echo 0; }

uninstall() {
  launchctl bootout "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || true
  rm -f "$PLIST"
  rm -rf "$DIR"
  rm -f "$LOG" "$LOG.old"
  say "Life OS Mail is removed from this Mac. Apple Mail itself is untouched: sorted mail stays where it is and nothing was deleted."
}

main() {
  [ "$(uname -s)" = "Darwin" ] || die "this installer is for a Mac."
  case "${1:-}" in
    --uninstall|uninstall) uninstall; return 0 ;;
    --status|status)
      [ -f "$DIR/lifeos-mail.js" ] || die "it isn't installed yet."
      /usr/bin/osascript -l JavaScript "$DIR/lifeos-mail.js" --status </dev/null; return 0 ;;
  esac

  local key="${1:-}" uidn src here before now i
  uidn=$(id -u)
  if [ -z "$key" ] && [ -f "$DIR/config.json" ]; then        # update: keep the saved key
    key=$(sed -n 's/.*"key"[[:space:]]*:[[:space:]]*"\([A-Za-z0-9_-]*\)".*/\1/p' "$DIR/config.json" | head -n 1)
  fi
  [[ "$key" =~ ^[A-Za-z0-9_-]{16,200}$ ]] || die "the connect key is missing or incomplete. Copy the whole command again from the Life OS Mail page (Mail → Connect your inboxes)."
  case "$BRAIN" in https://*) ;; *) die "LIFEOS_BRAIN must be an https:// address." ;; esac
  [[ "$BRAIN" != *[\"\\[:space:]]* ]] || die "LIFEOS_BRAIN has characters it can't contain."
  BASE="${BASE%/}"                                                  # the agent updates itself from here later (config.json "base")
  case "$BASE" in https://*) ;; *) die "LIFEOS_BASE must be an https:// address." ;; esac
  [[ "$BASE" != *[\"\'\\[:space:]]* ]] || die "LIFEOS_BASE has characters it can't contain."
  [ -d /System/Applications/Mail.app ] || [ -d /Applications/Mail.app ] || die "Apple Mail isn't on this Mac."

  say "Installing Life OS Mail for Apple Mail…"
  launchctl bootout "gui/$uidn/$LABEL" >/dev/null 2>&1 || true   # an older copy: stop it first
  umask 077
  mkdir -p "$DIR" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
  chmod 700 "$DIR"
  rm -rf "$DIR/run.lock"                                            # the copy we just stopped can't be mid-run any more

  # the agent: from this folder when run from a copy of the repo, otherwise from the Life OS site
  src="${BASH_SOURCE[0]:-}"; here=""
  if [ -n "$src" ] && [ -f "$src" ] && [ -f "$(dirname "$src")/lifeos-mail.js" ]; then here="$(dirname "$src")/lifeos-mail.js"; fi
  if [ -n "$here" ]; then
    cp "$here" "$DIR/lifeos-mail.js.new"
  else
    curl -fsSL -m 60 "$BASE/mac/lifeos-mail.js" -o "$DIR/lifeos-mail.js.new" </dev/null \
      || die "couldn't download the agent from $BASE. Check the internet connection and try again."
  fi
  if ! grep -q 'LIFEOS_MAIL_AGENT' "$DIR/lifeos-mail.js.new"; then
    rm -f "$DIR/lifeos-mail.js.new"; die "the downloaded agent doesn't look right. Try again in a minute."
  fi
  mv -f "$DIR/lifeos-mail.js.new" "$DIR/lifeos-mail.js"

  printf '{"key":"%s","brain":"%s","base":"%s","intervalMin":5}\n' "$key" "$BRAIN" "$BASE" > "$DIR/config.json.new"
  chmod 600 "$DIR/config.json.new"
  mv -f "$DIR/config.json.new" "$DIR/config.json"

  # First sort in the foreground, so macOS asks for permission while you're watching.
  say ""
  say "Sorting your mail for the first time (up to a few minutes)."
  say ">>> If macOS asks to let Terminal (or osascript) control \"Mail\", click OK. <<<"
  if LIFEOS_MAIL_INSTALLING=1 /usr/bin/osascript -l JavaScript "$DIR/lifeos-mail.js" </dev/null; then   # (no self-update check: this copy is fresh)
    say "First sort done."
  else
    say ""
    say "The first sort didn't finish (the reason is just above). If it says macOS hasn't allowed it to control Mail:"
    say "  System Settings → Privacy & Security → Automation → under Terminal (and osascript) switch on Mail,"
    say "  then run this same command again. Installing the every-5-minutes job anyway."
  fi

  # The every-5-minutes job (also runs at login and right now).
  cat > "$PLIST.new" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/osascript</string><string>-l</string><string>JavaScript</string>
    <string>$(xml "$DIR/lifeos-mail.js")</string>
  </array>
  <key>StartInterval</key><integer>300</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$(xml "$LOG")</string>
  <key>StandardErrorPath</key><string>$(xml "$LOG")</string>
</dict>
</plist>
EOF
  plutil -lint "$PLIST.new" >/dev/null || die "the LaunchAgent file didn't come out right."
  mv -f "$PLIST.new" "$PLIST"
  if [ -f "$LOG" ] && [ "$(size "$LOG")" -gt 2000000 ]; then mv -f "$LOG" "$LOG.old"; fi
  before=$(size "$LOG")
  launchctl enable "gui/$uidn/$LABEL" >/dev/null 2>&1 || true     # undo an earlier "switched off in Life OS"
  if ! launchctl bootstrap "gui/$uidn" "$PLIST" 2>/dev/null; then
    sleep 2; launchctl bootout "gui/$uidn/$LABEL" >/dev/null 2>&1 || true
    launchctl bootstrap "gui/$uidn" "$PLIST" || die "macOS wouldn't start the background job (launchctl bootstrap failed)."
  fi

  say ""
  say "Starting the background job."
  say ">>> If macOS now asks to let \"osascript\" control \"Mail\", click OK (that's the every-5-minutes job). <<<"
  for i in $(seq 1 45); do
    sleep 2; now=$(size "$LOG")
    if [ "$now" -gt "$before" ]; then break; fi
    if [ "$i" -eq 45 ]; then say "(Still waiting on it; if a permission box is open, click OK. It keeps running every 5 minutes either way.)"; fi
  done
  if [ "$(size "$LOG")" -gt "$before" ]; then say "Background run: $(tail -n 1 "$LOG")"; fi

  say ""
  say "Done. Every inbox in Apple Mail is now sorted every 5 minutes while this Mac is awake:"
  say "  red flag = needs a reply · orange flag = worth knowing · \"Life OS/FYI\" and \"Life OS/Unimportant\" mailboxes = weeded out."
  say "It keeps itself up to date from $BASE (checked every 6 hours), so this is the last time you need Terminal for it."
  say "See it all on the Life OS Mail page."
  say "If macOS says \"Background Items Added\" (osascript), leave it switched on in System Settings → General → Login Items."
  say "Use this on one Mac only."
  say "Check on it:  osascript -l JavaScript \"$DIR/lifeos-mail.js\" --status"
  say "Remove it:    curl -fsSL $BASE/mac/install.sh | bash -s -- --uninstall"
}

main "$@"
