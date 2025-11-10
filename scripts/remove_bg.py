import sys
from rembg import remove
from PIL import Image
import os

def remove_background(input_path, output_path):
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        ext = os.path.splitext(output_path)[1].lower()
        if ext in [".jpg", ".jpeg"]:
            output_image = output_image.convert("RGB")
        output_image.save(output_path)
        print("Background removed successfully")
    except Exception as e:
        print("Error:", str(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    remove_background(input_path, output_path)
