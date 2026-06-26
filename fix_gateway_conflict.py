import re

with open("src/components/GatewayConfig/GatewayConfig.tsx", "r") as f:
    content = f.read()

# Replace block 1
content = re.sub(
    r"  \}, \[selectedGatewayId, selectedGateway\?\.status, activeDiagnosticTab, selectedGateway, selectedGateway\?\.id, selectedGateway\?\.protocol, selectedGateway\?\.name\]\);\n>>>>>>> origin/master\n=======\n  \}, \[selectedGatewayId, selectedGateway\?\.status, activeDiagnosticTab, selectedGateway, selectedGateway\?\.id, selectedGateway\?\.protocol, selectedGateway\?\.name\]\);\n=======\n  \}, \[selectedGatewayId, selectedGateway\?\.status, activeDiagnosticTab, selectedGateway, selectedGateway\?\.id, selectedGateway\?\.protocol, selectedGateway\?\.name\]\);\n>>>>>>> origin/master",
    r"  }, [selectedGatewayId, selectedGateway?.status, activeDiagnosticTab, selectedGateway, selectedGateway?.id, selectedGateway?.protocol, selectedGateway?.name]);",
    content,
    flags=re.MULTILINE
)

# Replace block 2
content = re.sub(
    r"    \} catch \{\n>>>>>>> origin/master\n=======\n    \} catch \{\n=======\n    \} catch \{\n>>>>>>> origin/master",
    r"    } catch {",
    content,
    flags=re.MULTILINE
)

with open("src/components/GatewayConfig/GatewayConfig.tsx", "w") as f:
    f.write(content)
