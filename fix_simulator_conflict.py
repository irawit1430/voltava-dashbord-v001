import re

with open("server/simulator.ts", "r") as f:
    content = f.read()

content = re.sub(
    r"      /\* const isDeviceMatched = gw\.connectedDevices\.length > 0 && gw\.connectedDevices\.some\(dId => \{\n>>>>>>> origin/master\n=======\n      /\* const _isDeviceMatched = gw\.connectedDevices\.length > 0 && gw\.connectedDevices\.some\(dId => \{\n=======\n      /\* const isDeviceMatched = gw\.connectedDevices\.length > 0 && gw\.connectedDevices\.some\(dId => \{\n>>>>>>> origin/master",
    r"      /* const isDeviceMatched = gw.connectedDevices.length > 0 && gw.connectedDevices.some(dId => {",
    content,
    flags=re.MULTILINE
)

with open("server/simulator.ts", "w") as f:
    f.write(content)
