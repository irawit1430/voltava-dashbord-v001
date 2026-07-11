## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2026-07-11 - Conversational UI Accessibility
**Learning:** Found conversational chat interfaces lacking aria-live announcements and proper form controls. A visually updating chat stream without aria attributes leaves screen reader users completely unaware of new messages or loading states (like "Thinking...").
**Action:** Always add `aria-live="polite"` to message containers so asynchronous updates are announced, and ensure all icon-only action buttons (like "Send") and input fields have clear `aria-label` descriptors.
