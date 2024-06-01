from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model.train(data="C:\\Users\\giffordj1\\Desktop\\Senior Project\\NabGo\\Go Positions.v6-yolov8n-25epochs-resize640x640_aug3x.yolov8\\data.yaml", epochs=1, device=0)

success = model.export(format="onnx")