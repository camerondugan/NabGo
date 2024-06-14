package main

import (
	"fmt"
	"net/http"
)

func predictResults(w http.ResponseWriter, _ *http.Request) {
	fmt.Fprintf(w, "hello what do you have for me?\n")
}

func runPredictionServer() {
	// set things to respond to
	http.HandleFunc("/results", predictResults)
	// define a server and what address it listens to
	server := &http.Server{
		Addr:    ":8889",
		Handler: nil,
	}

	fmt.Println("starting server")
	err := server.ListenAndServe()
	fatalErrCheck(err)
}
