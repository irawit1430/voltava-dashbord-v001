with open('src/hooks/useTelemetry.ts', 'r') as f:
    content = f.read()

import re

content = re.sub(r'<<<<<<< HEAD\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> ee312aa \(Refactor packet analyzer and optimistic UI\)\n', r'\1', content)

with open('src/hooks/useTelemetry.ts', 'w') as f:
    f.write(content)
