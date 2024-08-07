import json
import sys
from typing import List

import torch
from ultralytics import YOLO

FOLDER = "train2"


"""
Predict board state using best model

@param target Image to predict

@return Output including bounding boxes

"""
def predict(target) -> List:
    model = YOLO("../runs/detect/" + FOLDER + "/weights/best.onnx")

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    print("using:", device)

    output = model.predict(target)
    return output


"""Write output including bounding boxes"""
def main():
    # target = "/home/cam/Pictures/VJUGcgNe.jpg"
    target = sys.argv[1]
    output = predict(target)
    with open(target + ".json", "w") as f:
        jsoncontent = {
            "classes": output[0].boxes.cls.tolist(),
            "boxes": output[0].boxes.xywh.tolist(),
        }
        f.write(json.dumps(jsoncontent))


if __name__ == "__main__":
    main()
