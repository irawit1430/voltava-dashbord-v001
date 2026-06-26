with open('src/components/GatewayConfig/GatewayConfig.tsx', 'r') as f:
    content = f.read()

import re

content = re.sub(r'<<<<<<< HEAD\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> e0d2e61 \(Fix lint warnings\)\n', r'\1', content)

with open('src/components/GatewayConfig/GatewayConfig.tsx', 'w') as f:
    f.write(content)
