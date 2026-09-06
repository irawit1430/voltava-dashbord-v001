## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2026-09-06 - Interactive Tab Component Accessibility
**Learning:** Found custom tab implementations (like the diagnostic terminal in GatewayConfig) lacking standard WAI-ARIA tabbed interface semantics, making them opaque to screen readers.
**Action:** When implementing custom tab UI, always ensure the container has `role="tablist"`, buttons have `role="tab"` and `aria-selected`, and the content panel has `role="tabpanel"` with an explicit `id` referenced by the tabs' `aria-controls`.
