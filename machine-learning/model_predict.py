import torch
from ultralytics import YOLO

# FOLDER = input("what name is the train folder?: ")
FOLDER = "train2"
model = YOLO("../runs/detect/" + FOLDER + "/weights/best.onnx")

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
if device != "cpu":
    answer = input("Do you really wanna go fast? ")
    if answer.lower()[0] != "y":
        device = "cpu"

print("using:", device)
target = input("paste the path to the file: ")

model.predict(target)
