## 2025-05-19 - Form Input Accessibility
**Learning:** Found multiple form inputs in components (like CostSavingsSimulator) lacking programmatic association with their labels using `htmlFor` and `id` attributes. This is a crucial accessibility gap for screen readers to navigate forms.
**Action:** When adding or updating forms, always ensure explicit `id` bindings on inputs and matching `htmlFor` attributes on corresponding `<label>` tags. Do not rely solely on nested `<label><input /></label>` structures if standalone `<label>` and `<input>` are used.
## 2024-05-15 - [Conversational UI Accessibility]
**Learning:** For dynamic message logs like an AI chat window, setting `role="log"` and `aria-live="polite"` on the container div is critical to ensure screen readers announce incoming messages and asynchronous loading states ("Thinking...") properly without disrupting the user. Icon-only buttons (like Send) and input fields inside the chat also strictly require `aria-label`s for context.
**Action:** Always add `role="log"` and `aria-live="polite"` to dynamically updating chat or activity feed containers. Ensure every interactive element inside has an explicit `aria-label`.
