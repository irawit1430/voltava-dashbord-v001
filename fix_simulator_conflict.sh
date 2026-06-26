cat << 'PATCH_EOF' > /tmp/simulator_patch.diff
<<<<<<< SEARCH
<<<<<<< HEAD
      const _isDeviceMatched = gw.connectedDevices.length > 0 && gw.connectedDevices.some(dId => {
=======
      /* const isDeviceMatched = gw.connectedDevices.length > 0 && gw.connectedDevices.some(dId => {
>>>>>>> origin/master
=======
      /* const _isDeviceMatched = gw.connectedDevices.length > 0 && gw.connectedDevices.some(dId => {
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

apply_patch("server/simulator.ts", "/tmp/simulator_patch.diff")
'
