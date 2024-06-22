package main

import (
	"fmt"
	"net/http"
	"os/exec"
)

func predictResults(w http.ResponseWriter, _ *http.Request) {
	fmt.Fprintf(w, "hello what do you have for me?\n")
	// create two pipes: one for image (go to python)
	// code here
	// One for results (python to go)
	// code there

	// Call the Python script that uses these pipes
	cmd := exec.Command("python", "../machine-learning/server-predict.py")
	stdout, err := cmd.Output()
	if err != nil {
		fmt.Println("Python command had err: \n" + err.Error())
		panic("Python failed in some way")
	}
	fmt.Println(stdout)
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
