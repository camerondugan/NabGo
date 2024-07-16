FROM golang:latest AS build-stage
WORKDIR /

COPY backend/go.mod backend/go.sum ./
COPY backend/*.go ./

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o nabgo-backend

FROM python:3.11-slim AS venv-stage
WORKDIR /

COPY machine-learning/requirements.txt ./

RUN python -m venv ./env
ENV PATH="./env/bin:$PATH"

RUN ./env/bin/python3 -m pip install -r requirements.txt

FROM python:3.11-slim AS final-stage
WORKDIR /backend

COPY runs/detect/train2/weights/best.onnx ../runs/detect/train2/weights/best.onnx
COPY machine-learning/server-predict.py ../machine-learning/server-predict.py
COPY --from=venv-stage env ../machine-learning/env
COPY --from=build-stage nabgo-backend ./

EXPOSE 8888/tcp
EXPOSE 8888/udp

RUN apt-get update && apt-get install libgl1 libglib2.0-0 -y

CMD ["./nabgo-backend"]
