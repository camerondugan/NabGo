from http.server import BaseHTTPRequestHandler, HTTPServer


class JobServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        match self.path:
            case "/NewJob":
                self.handle_job()
        self.wfile.write(bytes("<h1>Hello there, listening</h1>", "utf-8"))

    def handle_job(self):
        print("we got a job, look mom we did it.")


def serve():
    web_server = HTTPServer(("localhost", 8890), JobServer)
    try:
        web_server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    serve()
