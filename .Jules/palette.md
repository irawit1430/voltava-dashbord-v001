## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2024-08-21 - Added Accessibility Attributes to Custom Tab Components
**Learning:** Found custom tabbed interfaces (Device Detail charts, Gateway Config terminals) that lacked appropriate WAI-ARIA tab roles and states. The project uses standard `<button>` elements inside flex containers to simulate tabs.
**Action:** When working on custom tab components in this app, ensure they implement `role="tablist"` on the container and `role="tab"` with `aria-selected` on the tab buttons to properly expose them to assistive technologies. Additionally, hide non-interactive decorative icons inside buttons using `aria-hidden="true"`.
