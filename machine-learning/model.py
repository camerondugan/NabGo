from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model.train(
    data="./data/data.yaml",
    epochs=1,
    device=0,
)

success = model.export(format="onnx")

