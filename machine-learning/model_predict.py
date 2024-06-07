import torch
from ultralytics import YOLO

folder = input("what name is the train folder?: ")
model = YOLO("../runs/detect/" + folder + "/weights/best.onnx")

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
if device != "cpu":
    answer = input("Do you really wanna go fast? ")
    if answer.lower()[0] != "y":
        device = "cpu"

print("using:", device)
target = input("paste the path of file: ")

model.predict(target)
