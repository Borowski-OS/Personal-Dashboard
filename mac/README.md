# Life OS Mail on your Mac

This lets Life OS sort **every inbox you already have in Apple Mail**: the church, Anchor Soul, Crosswind and Cox.
It connects all of them at once. There's nothing to sign in to and no Google screens to click through.

Every 5 minutes, while your Mac is awake, it reads what's new in Mail and sends it to Life OS to sort. Then it tidies Mail:

| Life OS says   | What you see in Apple Mail                                       |
|----------------|------------------------------------------------------------------|
| Needs a reply  | **red flag**, stays in the inbox                                  |
| Worth knowing  | **orange flag**, stays in the inbox                               |
| FYI            | moved to the **Life OS → FYI** mailbox                            |
| Unimportant    | moved to the **Life OS → Unimportant** mailbox (real senders you don't need) |
| Spam / Junk    | moved to that account's **Junk** mailbox (scams and garbage)      |

- Anything you flagged yourself keeps your flag: it stays in your inbox, and it never goes to Junk (even if you flagged it
  in Life OS → Unimportant). Nothing is ever deleted.
- Mail from people you know, or a reply in a conversation you started, never goes to Junk. At most it's Unimportant.
- If you drag something back into your inbox from Life OS → FYI, Life OS → Unimportant or the Junk mailbox, Life OS
  learns that sender matters. This counts for email from the last week, one or two at a time.
- It only counts as "you moved it back" once it has seen the email leave your inbox and land where it was filed.
  Sometimes Apple Mail or Gmail puts a filed email back in the inbox on its own. That email is filed again (twice at most)
  and then left in your inbox. It is never shown on the dashboard as new, and Life OS doesn't learn anything from it.
  The same goes for a batch of three or more filed emails that come back at the same moment: that is Mail re-syncing
  an account, not you.
- Replies you write on the Life OS Mail page (or ask the AI chat for) go out from the same account the email came to,
  within about 5 minutes. "Save as draft" opens the reply in Mail, ready for you to press Send.
- On the Gmail accounts, the Life OS → FYI and Life OS → Unimportant mailboxes are the same as Gmail's "Life OS/FYI" and
  "Life OS/Unimportant" labels, and the Junk mailbox is Gmail's Spam. A red or orange flag shows up as a star in Gmail.
- It keeps itself up to date. About every 6 hours it checks the Life OS site for a newer version of itself. It only
  switches to one that is newer, looks complete, passes Apple's own script check, and starts up correctly in a quick
  trial run on the side. The old copy is kept. Your key, your settings and what it remembers are never touched.
- If your Mac was set up before October 13, 2026, run the setup command once more. That brings it to the version that
  updates itself and checks every 5 minutes. After that you won't need Terminal for updates.

## Set it up (about 2 minutes)

1. Open the Life OS dashboard → **Mail** → **Connect your inboxes**, and press **Copy** next to the Mac command.
2. On your Mac, open **Terminal**: press ⌘-Space, type `Terminal` and press Return. You can also ask Claude on your Mac
   to run the command for you.
3. Paste the command, press Return, and wait. The first sort can take a minute or two.
4. When macOS asks whether **Terminal** (or **osascript**) may control **Mail**, click **OK**. It asks once for the first
   sort and once for the every-5-minutes job, so you may see this box twice.
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
- "couldn't create Life OS/FYI" (or Unimportant): make the mailboxes yourself, once per account. In Mail, choose
  **Mailbox → New Mailbox**, set **Location** to the account, and name it `Life OS`. Then select that new mailbox and
  make `FYI` and `Unimportant` inside it. On the Gmail accounts they may already be there as labels. Until they exist,
  that mail goes to the account's Archive instead, and the agent tries making them again once a day. (`Life OS/Junk` is
  only made for an account that has no Junk mailbox.)
- A reply on the Mail page says "it's open in Mail on the Mac": Mail didn't take the text, or wanted to send it from a
  different account, so nothing was sent. The reply is waiting in a Mail window. Check it, then press Send.
- Replies and moves work for email that is still in that account's inbox, in Life OS → FYI, Unimportant or Junk, in any
  of its Junk / Spam mailboxes, or in its Archive. Email you deleted (in the Trash) is left there. On Gmail accounts, email
  you archived yourself only lives in All Mail, which the agent doesn't search. When an email can't be found, the
  message on the Mail page lists the mailboxes it looked in.

---

## Notes for a Claude session on Brad's Mac

Files:

- `~/Library/Application Support/LifeOSMail/` — `lifeos-mail.js` (the agent, copied from this folder),
  `config.json` (`{key, brain, base, intervalMin}`, chmod 600; the key is the Life OS Script Property `MAIL_AGENT_KEY`;
  `base` is the site it was installed from and updates itself from), `state.json` (what has been handled),
  `update.json` (last self-update check and what it said), `lifeos-mail.prev.js` (the copy before the last
  self-update), `run.lock` (only while a run is going).
- `~/Library/LaunchAgents/com.lifeos.mail.plist` — `StartInterval` 300 (every 5 minutes), `RunAtLoad`. An agent that finds
  the old 600 rewrites only this file to 300. launchd reads it at the next login, and the job never reloads itself.
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
rm ~/Library/Application\ Support/LifeOSMail/update.json                                     # check for an update on the next run
cp ~/Library/Application\ Support/LifeOSMail/lifeos-mail.prev.js ~/Library/Application\ Support/LifeOSMail/lifeos-mail.js   # undo the last self-update
bash mac/install.sh            # from a clone of this repo: update the agent and keep the saved key
bash mac/install.sh --uninstall
```

Self-update: at most every 6 hours (also after a failed run, since a newer agent may fix it; never in `--dry` or during
`install.sh`'s first run), it downloads `<base>/mac/lifeos-mail.js` over https only to a temp file. The file replaces the
installed copy only if its `var VERSION='N'` line has a higher N, it has the `LIFEOS_MAIL_AGENT` marker, its size is sane,
`osacompile -l JavaScript` accepts it, and it passes a self-check: it is run once as
`LIFEOS_MAIL_DIR=<empty temp folder> osascript -l JavaScript <file> --selfcheck` and must print exactly
`LIFEOS_MAIL_SELFCHECK v<N>` within 30 seconds (it is killed after that). That catches a copy that compiles but crashes on
start, which would otherwise stop every run, self-update included. The swap is a `mv`, and the old copy is kept as
`lifeos-mail.prev.js`. The new copy runs from the next run. **Bump `VERSION` for every change to `lifeos-mail.js`, and keep
`--selfcheck` working** (it runs the start-up path: config, lock, state; no key, no Mail, no network): the Mac only picks
up a higher number that passes it, and Life OS reads `VERSION` as `agentVersion` (a number; 2+ knows Unimportant, 3+ has
checked moves, and Life OS trusts its "rescued" reports).

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
  by Message-ID in that account's inbox, then in the mailbox it was moved to, then Life OS/Unimportant, Life OS/Junk,
  Life OS/FYI, every Junk / Spam mailbox (Yahoo-hosted Cox can have both Junk and Bulk Mail), Archive, and last the
  Trash. A move of something in the Trash is reported done with a note and nothing is moved.
  They never search `[Gmail]/All Mail`: it is too big, and moving mail out of it would trash it on Gmail.
- Replies and new emails: the text is set, read back and checked (Brad's text first, then Mail's quote of the
  original). If Mail doesn't keep it, or picks another account to send from, nothing is sent. The message is left
  open in Mail and the result says so.
- `id` and `threadId` are the Message-ID header without `<>`. Mail has no thread ids.
- Categories: `reply` (red flag), `important` (orange flag), `fyi` → Life OS/FYI, `unimportant` → Life OS/Unimportant,
  `junk` ("Spam / Junk", sent with `spam:true`) → the account's Junk mailbox, or Life OS/Junk when it has none. Older
  Life OS answers still work: `spam` means junk, and junk with `spam:false` goes to Life OS/Junk. Junk for a flagged
  email or a reply to Brad's own mail is filed as Unimportant and stays put. The agent sends `agentVersion:'3'`; Life OS
  gives a v1 agent Unimportant as its old Life OS/Junk.
- Every move is checked. Right after `Mail.move`, the old message reference must stop working or name another mailbox. If
  it doesn't, the agent sets the message's mailbox instead. If the reference still names the old mailbox, that mailbox is
  searched for the Message-ID (a lagging reference, or "Junk" vs "Life OS/Junk", which share a name). Only if it is really
  still there is the email remembered as `h` ("held"), and a Teach move answers "Mail didn't move it".
- An inbox's key is the first address Mail lists for it. If Mail later lists another of its addresses first, the agent
  keeps the key it already synced under (no second hello, no 3 days of mail sent again).
- Corrections, and what state.json remembers per email (`seen`: `m` = where it was moved, `k` = move confirmed,
  `n` = times moved again, `h` = held, `q` / `r` = rescued / replied reported):
  - A moved email that a later run finds gone from the inbox AND in the mailbox it was put in (that mailbox's
    Message-IDs from the last 30 days, read once per run): the move is confirmed (`k`). For Gmail's All Mail, or a mailbox
    that no longer exists, "gone from the inbox" is enough. Gone from both: Brad deleted or refiled it (or Mail was
    mid-sync), so it is forgotten and can never be reported as rescued. A mailbox Mail can't read now: next run.
  - Back in the inbox before it was confirmed: the move didn't stick. It is moved again, once per run and at most twice
    (`n`), then left in the inbox and forgotten. The run line and the account's last problem say so. It is left alone right
    away if Brad flagged it, or if it seemed to move but isn't where it was put either (that's probably Brad). Entries
    saved by v2 have no `k` and are treated as not confirmed.
  - `rescued`: a confirmed move that is back in the inbox and gone from the mailbox it was put in. If it is still there
    too, that wasn't Brad. Gmail keeps the label when a whole conversation is moved back to the inbox, for example by a
    whole-thread action somewhere else. The same goes for an email that now also sits in Life OS/Important or Life OS/Needs
    reply: the Google agent moved its whole conversation back. Such an email is forgotten, not reported. Also forgotten,
    never reported: email that arrived more than 7 days ago (`RESC_AGE`), and 3 or more (`RESC_BURST`) coming back for
    one account in the same run (Mail re-syncing; the run line says "N filed emails back in the inbox at once"). If Mail
    can't answer for the target mailbox or Life OS/Important, the email is looked at again next run, never reported on
    a guess. Before v3 every "back in the inbox" was reported. Life OS then marked the old email Important and open
    again, flagged it orange and learned the sender as important. That is how old emails showed up as new.
  - `replied`: a Needs-reply email now shows as replied in Mail. The agent then clears its red flag. When Brad teaches
    "Needs reply" on an email he had already answered (read before it is moved back), only a reply after that counts.
- Mail that Life OS hasn't sorted yet stays unmarked and goes again on the next run. A failed POST commits nothing.
- A command's qid is saved to `state.json` before Mail is touched, so a crash can't send anything twice. Its real
  result is saved as soon as it finishes. An interrupted command is reported as interrupted and is never re-run.
- `Life OS/FYI`, `Life OS/Unimportant` (and `Life OS/Junk` when there's no Junk mailbox) are created inside each account
  if they're missing. If Mail puts one somewhere
  else (On My Mac), the agent stops and says where. A failed attempt is retried once a day.
- `config.stop` from Life OS turns that one inbox off. If every inbox is off, the agent runs
  `launchctl disable` + `bootout` on its own job. `install.sh` turns it back on with `launchctl enable`.
- A `move` to `trash` is handled like archive (Life OS/Junk unless its label says FYI or Unimportant). The Mac agent never
  deletes or trashes anything, so Auto mode's "Trash after 14 days" only applies to inboxes connected through Google.
- HTTP goes through `/usr/bin/curl -L --data-binary @file`, without `-X POST`. Apps Script answers with a 302 that
  has to be followed as a GET, and `-X POST` would force POST on the redirect too.
- An offline test harness that uses a fake Mail object model lives outside the repo, because it isn't needed on
  the Mac.
