package main

import (
	"bytes"
	"log"
	"os/exec"
)

func analyze(initial string, moves string) []byte {
	cmd := exec.Command(
		"../machine-learning/env/bin/python3", "../machine-learning/analyze.py",
		initial, moves,
	)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		log.Println(stderr.String())
		fatalErrCheck(err)
	}

	out, err := cmd.Output()
	fatalErrCheck(err)
	return out
}
