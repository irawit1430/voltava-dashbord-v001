## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2026-07-13 - Conversational UI Accessibility
**Learning:** Discovered that conversational interfaces like the AIAssistant were missing `aria-live` and `role="log"` on the message container. This prevents screen readers from announcing dynamically added messages and loading states.
**Action:** Always add `aria-live="polite"` and `role="log"` to message containers in conversational UIs. Ensure all icon-only action buttons (like send buttons) and input fields have clear `aria-label` descriptors.
