package main

import (
	"bytes"
	"log"
	"os/exec"
)

// Execute Python script to predict image and write result
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
		log.Println(err.Error())
	}
}
