# Real-Device Operator Checklist

Status: ACTIVE

Use approved Owner, Manager, Staff, and linked-Google test accounts only. Use disposable records named `ACCEPTANCE TEST — <timestamp>` and one `ACCEPTANCE WORK — <timestamp>`. Do not share credentials, tokens, cookies, or secrets in evidence.

Record PASS/FAIL/BLOCKED plus device/browser and non-sensitive record IDs:

1. On desktop, Android Chrome, and the previously used WebView at approximately 360/390/412/430 px: password login, linked Google login, invalid-login safety, and unchanged disabled public registration.
2. With Remember Device checked: restart the browser and confirm restoration. Without it: restart and confirm login is required. Logout must clear the session and reject refresh.
3. Open/close the mobile drawer by link, backdrop, close button, and Escape where available; visit every authorized menu item and confirm page labels, active state, safe areas, touch targets, keyboard visibility, no horizontal overflow, and preserved desktop sidebar.
4. For Owner, Manager, and Staff, confirm expected navigation and read/write restrictions. Capture any unavailable role as BLOCKED; do not create roles.
5. Create/edit/deactivate/reactivate one disposable Resort; confirm inactive exclusion from new Work and retained history; finish deactivated.
6. Create/edit/duplicate-conflict/deactivate/reactivate one disposable Item Type; confirm inactive exclusion from counting and retained history; finish deactivated.
7. Create the acceptance Work and complete, without shortcuts: active Resort → Bag → Count add/update/delete → classification/data recording → image/camera/caption → Issue update → safe Claim lifecycle → Ready queue → Return → Closure.
8. Confirm CLOSED state, closed-work mutation protection, removal from Pending/Ready, and readable Work/count/image/issue/claim/timeline history.
9. Verify All/Today/Pending/Ready search, pagination, membership semantics, active navigation, and page titles throughout the Work lifecycle.
10. In Global Issue Center verify search, filters, pagination, context/link, resolve/reopen, and that embedded Work Detail remains the creation/edit flow.
11. As Owner/Manager verify Reports presets, custom/invalid ranges, URL persistence, cards/trends/resort/item/issue summaries, links, empty/partial display, and queue metric agreement. Confirm Staff is denied.
12. As Owner, make and restore one reversible Settings value; verify reload and shell label. Confirm Manager/Staff read-only behavior, member summary, Security link, and absence of secret/unknown fields.
13. In Security, verify linked identities and session controls without changing links unless an approved reversible account exists.
14. Report final Resort/Item/Work identifiers and disposition, screenshots for role/mobile/runtime evidence, and any defect using severity P0–P4 with reproduction, expected/actual result, and Trial Release impact.

Do not accept the Trial Release until every non-deferred item has operator evidence.
