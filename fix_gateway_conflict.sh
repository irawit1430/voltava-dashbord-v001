cat << 'PATCH_EOF' > /tmp/gateway_patch.diff
<<<<<<< SEARCH
<<<<<<< HEAD
  }, [selectedGatewayId, selectedGateway?.status, activeDiagnosticTab, selectedGateway?.id, selectedGateway?.protocol, selectedGateway?.name, selectedGateway]);
=======
  }, [selectedGatewayId, selectedGateway?.status, activeDiagnosticTab, selectedGateway, selectedGateway?.id, selectedGateway?.protocol, selectedGateway?.name]);
>>>>>>> origin/master
=======
  }, [selectedGatewayId, selectedGateway?.status, activeDiagnosticTab, selectedGateway, selectedGateway?.id, selectedGateway?.protocol, selectedGateway?.name]);
>>>>>>> REPLACE
<<<<<<< SEARCH
<<<<<<< HEAD
    } catch (_err) {
=======
    } catch {
>>>>>>> origin/master
=======
    } catch {
>>>>>>> REPLACE
PATCH_EOF
python -c '
import sys

def apply_patch(file_path, patch_path):
    with open(file_path, "r") as f:
        content = f.read()

    with open(patch_path, "r") as f:
        patch = f.read()

    search_marker = "<<<<<<< SEARCH\n"
    replace_marker = "=======\n"
    end_marker = ">>>>>>> REPLACE\n"

    blocks = patch.split(search_marker)[1:]
    for block in blocks:
        search_block, rest = block.split(replace_marker, 1)
        replace_block = rest.split(end_marker)[0]

        if search_block in content:
            content = content.replace(search_block, replace_block)
        else:
            print(f"Error: Could not find block:\n{search_block}")
            sys.exit(1)

    with open(file_path, "w") as f:
        f.write(content)

apply_patch("src/components/GatewayConfig/GatewayConfig.tsx", "/tmp/gateway_patch.diff")
'
