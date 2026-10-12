# Life OS Mail on your Mac

This lets Life OS sort **every inbox you already have in Apple Mail**: the church, Anchor Soul, Crosswind and Cox.
It connects all of them at once. There's nothing to sign in to and no Google screens to click through.

Every 10 minutes, while your Mac is awake, it reads what's new in Mail and sends it to Life OS to sort. Then it tidies Mail:

| Life OS says   | What you see in Apple Mail                          |
|----------------|-----------------------------------------------------|
| Needs a reply  | **red flag**, stays in the inbox                     |
| Worth knowing  | **orange flag**, stays in the inbox                  |
| FYI            | moved to the **Life OS → FYI** mailbox               |
| Junk           | moved to the **Life OS → Junk** mailbox              |
| Spam           | moved to that account's **Junk** mailbox             |

- Anything you flagged yourself stays in your inbox with your flag. Nothing is ever deleted.
- If you drag something back from Life OS → Junk or FYI into your inbox, Life OS learns that sender matters.
- Replies you write on the Life OS Mail page (or ask the AI chat for) go out from the same account the email came to,
  within about 10 minutes. "Save as draft" opens the reply in Mail, ready for you to press Send.
- On the Gmail accounts, the Life OS → FYI and Life OS → Junk mailboxes are the same as Gmail's "Life OS/FYI" and
  "Life OS/Junk" labels. A red or orange flag shows up as a star in Gmail.

## Set it up (about 2 minutes)

1. Open the Life OS dashboard → **Mail** → **Connect your inboxes**, and press **Copy** next to the Mac command.
2. On your Mac, open **Terminal**: press ⌘-Space, type `Terminal` and press Return. You can also ask Claude on your Mac
   to run the command for you.
3. Paste the command, press Return, and wait. The first sort can take a minute or two.
4. When macOS asks whether **Terminal** (or **osascript**) may control **Mail**, click **OK**. It asks once for the first
   sort and once for the every-10-minutes job, so you may see this box twice.
5. If macOS shows **Background Items Added** (it may name "osascript"), that's this. Leave it switched on: in
   **System Settings → General → Login Items**, under **Allow in the Background**, it must stay on or the sorting stops.
6. That's it. The Mail page will show each inbox as "Connected via your Mac".

Install it on **one Mac only**. Two Macs would each sort the same mail and could both send a queued reply.

Apple Mail needs to stay set up with your accounts. If Mail isn't open, Life OS opens it in the background. It never
quits Mail. When the Mac is asleep, nothing is sorted. Mail that came in while it was asleep gets sorted when it wakes
up, as long as it came in within the last 3 days.

## Stop it or remove it

- **Switch it off from Life OS:** set Config `mail_stop_<address>` to `yes` for an inbox. That inbox stops being
  sorted on the next run. Life OS checks again every 6 hours, so setting it back to `no` turns it on again. If every
  inbox is switched off, the Mac job turns itself off; run the setup command again to bring it back.
- **Remove it completely:** in Terminal, run
  `curl -fsSL https://borowski-os.github.io/Personal-Dashboard/mac/install.sh | bash -s -- --uninstall`
  Your mail stays exactly where it is.

## If something looks wrong

- "macOS hasn't let this control Mail": open **System Settings → Privacy & Security → Automation**, switch on **Mail**
  under Terminal and under osascript, then run the setup command again.
- "Mail didn't answer within 2 minutes": a permission box is probably waiting behind another window. Click **OK** on
  it, then run the setup command again.
- The Mail page says the key wasn't accepted: copy the command from the Mail page again and run it. It's safe to
  run it any number of times.
- "couldn't create Life OS/FYI" (or Junk): make the mailboxes yourself, once per account. In Mail, choose
  **Mailbox → New Mailbox**, set **Location** to the account, and name it `Life OS`. Then select that new mailbox and
  make `FYI` and `Junk` inside it. On the Gmail accounts they may already be there as labels. Until they exist, that
  mail goes to the account's Archive instead, and the agent tries making them again once a day.
- A reply on the Mail page says "it's open in Mail on the Mac": Mail didn't take the text, or wanted to send it from a
  different account, so nothing was sent. The reply is waiting in a Mail window. Check it, then press Send.
- Replies only work for email that is still in that account's inbox, in Life OS → FYI or Junk, or in its Junk mailbox.
  Email you archived yourself is left alone.

---

## Notes for a Claude session on Brad's Mac

Files:

- `~/Library/Application Support/LifeOSMail/` — `lifeos-mail.js` (the agent, copied from this folder),
  `config.json` (`{key, brain, intervalMin}`, chmod 600; the key is the Life OS Script Property `MAIL_AGENT_KEY`),
  `state.json` (what has been handled), `run.lock` (only while a run is going).
- `~/Library/LaunchAgents/com.lifeos.mail.plist` — `StartInterval` 600, `RunAtLoad`.
- `~/Library/Logs/LifeOSMail.log` — one line per run: account names, counts, timing and problems. Problems never
  quote an email's subject or text.

Commands:

```bash
osascript -l JavaScript ~/Library/Application\ Support/LifeOSMail/lifeos-mail.js --status   # accounts, last sync, last problem
osascript -l JavaScript ~/Library/Application\ Support/LifeOSMail/lifeos-mail.js --dry --counts   # what would be sent, counts only; changes nothing
osascript -l JavaScript ~/Library/Application\ Support/LifeOSMail/lifeos-mail.js            # one real run now
tail -n 20 ~/Library/Logs/LifeOSMail.log
launchctl print gui/$(id -u)/com.lifeos.mail | head -n 30                                    # is the job loaded?
launchctl kickstart -k gui/$(id -u)/com.lifeos.mail                                         # run the job now
bash mac/install.sh            # from a clone of this repo: update the agent and keep the saved key
bash mac/install.sh --uninstall
```

To test before it changes anything, run `--dry --counts` first. It reads Mail but sends nothing and moves or flags
nothing. Plain `--dry` also lists subjects. Use it only if Brad asks, and never paste subjects into a chat or a file.
Permissions are under System Settings → Privacy & Security → Automation (Terminal and osascript → Mail). The background
job also needs General → Login Items → Allow in the Background. Don't run `tccutil reset AppleEvents`: without an app
ID it clears the Automation permissions of every app.

The connect key is in `config.json` (only Brad's user can read it). It's also in Terminal's history, because the setup
command carried it. Anyone with the key can pull queued replies for every inbox. If it may have leaked, make a new
`MAIL_AGENT_KEY` in Life OS and run the new setup command.

How it works:

- A new inbox is announced first with an empty `mailsync` (`first:true`, no items). That way Life OS can answer
  `config.stop` before any email goes out. This happens once per inbox.
- Every run, for each enabled account in Apple Mail (address = the first of `emailAddresses()`), it sends one
  `mailsync` POST with `source:'mac'` and `accountName`. The POST carries new inbox mail (since the last sync minus
  30 minutes, at most 3 days back, newest 40), Brad's sent mail, and the corrections it noticed. It applies the
  decisions it gets back, runs the queued commands once each, and sends their results in a second POST in the same run.
  The contract is the same one the Google agent uses; see MAIL_SPEC "Agent → brain".
- Reading: each account's own inbox (and the combined Sent) is listed with one `whose()` plus batch property reads,
  sorted here, and only the chosen emails are read one by one, round-robin across accounts. Commands look an email up
  by Message-ID in that account's inbox, then in the mailbox it was moved to, then Life OS/Junk, Life OS/FYI and Junk.
  They never search `[Gmail]/All Mail`: it is too big, and moving mail out of it would trash it on Gmail.
- Replies and new emails: the text is set, read back and checked (Brad's text first, then Mail's quote of the
  original). If Mail doesn't keep it, or picks another account to send from, nothing is sent. The message is left
  open in Mail and the result says so.
- `id` and `threadId` are the Message-ID header without `<>`. Mail has no thread ids.
- Corrections:
  - `rescued`: something the agent moved out of the inbox is back in an inbox.
  - `replied`: a Needs-reply email now shows as replied in Mail. The agent then clears its red flag.
- Mail that Life OS hasn't sorted yet stays unmarked and goes again on the next run. A failed POST commits nothing.
- A command's qid is saved to `state.json` before Mail is touched, so a crash can't send anything twice. Its real
  result is saved as soon as it finishes. An interrupted command is reported as interrupted and is never re-run.
- `Life OS/FYI` and `Life OS/Junk` are created inside each account if they're missing. If Mail puts one somewhere
  else (On My Mac), the agent stops and says where. A failed attempt is retried once a day.
- `config.stop` from Life OS turns that one inbox off. If every inbox is off, the agent runs
  `launchctl disable` + `bootout` on its own job. `install.sh` turns it back on with `launchctl enable`.
- A `move` to `trash` is handled as Life OS/Junk. The Mac agent never deletes or trashes anything.
- HTTP goes through `/usr/bin/curl -L --data-binary @file`, without `-X POST`. Apps Script answers with a 302 that
  has to be followed as a GET, and `-X POST` would force POST on the redirect too.
- An offline test harness that uses a fake Mail object model lives outside the repo, because it isn't needed on
  the Mac.
