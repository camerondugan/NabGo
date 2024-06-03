package main

import (
	"fmt"
	"net/http"
	"time"
)

func hello(w http.ResponseWriter, _ *http.Request) {
	fmt.Fprintf(w, "hello\n")
}

func headers(w http.ResponseWriter, req *http.Request) {
	for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(w, "%v: %v\n", name, h)
		}
	}
}

func runServer() {
	// set things to respond to
	http.HandleFunc("/hello", hello)
	http.HandleFunc("/headers", headers)
	// define a server and what address it listens to
	server := &http.Server{
		Addr:        ":8888",
		Handler:     nil,
		IdleTimeout: 15 * time.Minute,
	}

	err := server.ListenAndServe()
	fatalErrCheck(err)
}
