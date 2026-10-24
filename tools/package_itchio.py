import os
import zipfile

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(ROOT_DIR, "dist")
RELEASE_DIR = os.path.join(ROOT_DIR, "release")
OUT_ZIP = os.path.join(RELEASE_DIR, "smoothfaces-epic-itchio.zip")


def main() -> None:
    if not os.path.isdir(DIST_DIR):
        raise SystemExit("dist/ directory not found. Run 'npm run build' first.")
    os.makedirs(RELEASE_DIR, exist_ok=True)
    count = 0
    with zipfile.ZipFile(OUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for dirpath, _, filenames in os.walk(DIST_DIR):
            for fname in filenames:
                full_path = os.path.join(dirpath, fname)
                rel_path = os.path.relpath(full_path, DIST_DIR).replace("\\", "/")
                zf.write(full_path, rel_path)
                count += 1
    size_mb = os.path.getsize(OUT_ZIP) / (1024 * 1024)
    print(f"Created itch.io HTML5 package: {OUT_ZIP} ({count} files, {size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
