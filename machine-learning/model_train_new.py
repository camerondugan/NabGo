import torch
from ultralytics import YOLO

"""Train YOLOv8n model"""
model = YOLO("yolov8n.pt")

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
if device != "cpu":
    answer = input("Do you really wanna go fast? ")
    if answer.lower()[0] != "y":
        device = "cpu"

print("using:", device)

results = model.train(
    data="./data/data.yaml",
    epochs=200,
    device=device,
)

success = model.export(format="onnx")
