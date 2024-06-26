package main

import (
	"bytes"
	"log"
	"os/exec"
)

func predict(fName string) {
	cmd := exec.Command(
		"../machine-learning/env/bin/python3", "../machine-learning/server-predict.py",
		fName,
	)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		log.Println(stderr.String())
		fatalErrCheck(err)
	}
	// read the json file it creates when it finishes running
}
