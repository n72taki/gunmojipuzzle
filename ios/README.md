# iOS App Store Handoff

This folder tracks the iOS distribution handoff for `ぐんもじぱずる`.

Current state:

- No Xcode project is checked in yet.
- The intended iOS route is a thin native game shell using `WKWebView`.
- The wrapper should bundle the public web build or load the final HTTPS host after review of offline behavior.
- App Store submission must be built on macOS with Xcode 26 or later and the iOS 26 SDK or later.
- If the in-app `G` purchase flow ships on iOS, it must use StoreKit in-app purchases. The current browser mock purchase flow is blocked from production submission.

Handoff files:

- `app-store-connect.template.json`: App Store Connect metadata, privacy, age rating, and review-note checklist.
- `wkwebview-wrapper.template.json`: Native wrapper requirements for the iOS engineer/Xcode project.
- `docs/APP_STORE_SUBMISSION_PACK.md`: Human-readable App Store submission pack.

Do not submit to App Review until:

- a real Xcode project exists;
- the app is built with the required current Apple toolchain;
- policy URLs are hosted over HTTPS;
- StoreKit is integrated for paid `G` or the purchase screen is disabled;
- screenshots, privacy answers, age rating, and review notes match the actual binary.
