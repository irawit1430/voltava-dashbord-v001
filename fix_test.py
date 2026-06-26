import re

with open('server/server.test.ts', 'r') as f:
    content = f.read()

content = content.replace(".set(\\'Authorization\\', \\'Bearer default-dev-key\\')", ".set('Authorization', 'Bearer default-dev-key')")
content = content.replace(".set(\\'Authorization\\', \\'Bearer default-dev-key\\');", ".set('Authorization', 'Bearer default-dev-key');")

with open('server/server.test.ts', 'w') as f:
    f.write(content)

print("Fixed syntax error in test file")
