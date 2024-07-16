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

FROM gcr.io/distroless/static-debian12:latest AS final-stage
WORKDIR /

COPY --from=venv-stage env ./
COPY --from=build-stage nabgo-backend ./

CMD ["/nabgo-backend"]
