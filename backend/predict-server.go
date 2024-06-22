package main

import (
	"bytes"
	"log"
	"os/exec"
)

func getPredictResults(data string) {
	// call's python and reads the json file it creates when it finishes running

	// Call the Python script that uses these pipes
	// f, err := os.CreateTemp("", "predictionImage-*.jpg")
	// fatalErrCheck(err)
	// defer f.Close()
	// defer os.Remove(f.Name())
	// fmt.Println(f.Name())
	// fill jpg file with image converted to jpg

	cmd := exec.Command(
		"../machine-learning/env/bin/python3", "../machine-learning/server-predict.py",
		"/home/cam/Pictures/xPQ_Sx2E.jpg",
	)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		log.Println(stderr.String())
		fatalErrCheck(err)
	}
}
