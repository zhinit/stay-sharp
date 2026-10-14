#!/bin/sh
set -eu
case "$(uname -s)" in
  Darwin) os="darwin" ;;
  Linux) os="linux" ;;
  *) echo "Unsupported operating system"; exit 1 ;;
esac

case "$(uname -m)" in
  arm64|aarch64) arch="arm64" ;;
  x86_64|amd64) arch="x64" ;;
  *) echo "Unsupported processor"; exit 1 ;;
esac

archive="stay-sharp-bun-$os-$arch.tar.gz"
release_url="https://github.com/zhinit/stay-sharp/releases/latest/download"

for command in curl tar awk install; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "Required command not found: $command" >&2
    exit 1
  }
done

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' 0
trap 'exit 1' HUP INT TERM

echo "Downloading StaySharp for $os ($arch)..."
curl -fsSL "$release_url/$archive" -o "$tmp_dir/$archive"
curl -fsSL "$release_url/checksums.txt" -o "$tmp_dir/checksums.txt"

expected="$(awk -v file="$archive" '$2 == file { print $1 }' "$tmp_dir/checksums.txt")"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmp_dir/$archive" | awk '{ print $1 }')"
elif command -v shasum >/dev/null 2>&1; then
  actual="$(shasum -a 256 "$tmp_dir/$archive" | awk '{ print $1 }')"
else
  echo "A SHA-256 tool is required: sha256sum or shasum." >&2
  exit 1
fi

if [ -z "$expected" ] || [ "$actual" != "$expected" ]; then
  echo "Download checksum verification failed." >&2
  exit 1
fi

tar -xzf "$tmp_dir/$archive" -C "$tmp_dir" stay-sharp
install_dir="$HOME/.local/bin"
mkdir -p "$install_dir"
install -m 755 "$tmp_dir/stay-sharp" "$install_dir/stay-sharp"
echo "Installed StaySharp to $install_dir/stay-sharp"

case ":$PATH:" in
  *":$install_dir:"*) echo "Run stay-sharp to get started." ;;
  *)
    echo 'Add this line to ~/.zshrc or ~/.bashrc, then open a new terminal:'
    echo 'export PATH="$HOME/.local/bin:$PATH"'
    ;;
esac
