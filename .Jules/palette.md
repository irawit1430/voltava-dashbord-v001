## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.

## 2025-10-24 - Conversational UI Accessibility
**Learning:** Found that the AI Assistant's chat message list lacked ARIA properties to announce incoming messages and loading states.
**Action:** When building conversational UIs, always add `role="log"` and `aria-live="polite"` to the message list container so asynchronous updates (like loading states and incoming messages) are announced to screen readers.
