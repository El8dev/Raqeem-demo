from PIL import Image

def remove_white_bg(img_path, out_path, tolerance=30):
    img = Image.open(img_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is near white
        if item[0] >= 255-tolerance and item[1] >= 255-tolerance and item[2] >= 255-tolerance:
            # Change to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(out_path, "PNG")

remove_white_bg('guitar.png', 'guitar_transparent.png', tolerance=20)
